"""
data_loader.py
Converts the normalized long-form FeedbackFact rows into a wide DataFrame:
  - One row per submission_id
  - One column per FeedbackCategory name
  - Plus college_id, would_recommend, overall_rating (mean of all scores)
"""
import pandas as pd
from api.models import FeedbackFact


def load_feedback_wide(college_id: int = None) -> pd.DataFrame:
    """
    Returns a wide DataFrame. Column names after pivoting are the literal
    category_name strings stored in FeedbackCategory (dynamically determined).
    overall_rating is computed as the mean score across all categories for
    each submission_id, since the star schema doesn't store it separately.
    """
    qs = FeedbackFact.objects.select_related(
        "category", "college", "student_profile"
    ).values(
        "submission_id",
        "college_id",
        "category__category_name",
        "score",
        "would_recommend",
        "sentiment",
    )

    if college_id is not None:
        qs = qs.filter(college_id=college_id)

    df_long = pd.DataFrame.from_records(list(qs))
    if df_long.empty:
        return pd.DataFrame()

    # Pivot long → wide: one row per submission, one col per category
    df_wide = df_long.pivot_table(
        index=["submission_id", "college_id", "would_recommend", "sentiment"],
        columns="category__category_name",
        values="score",
        aggfunc="first",
    ).reset_index()

    df_wide.columns.name = None  # remove MultiIndex column name

    # Derive overall_rating as mean of all category score columns
    category_cols = [
        c for c in df_wide.columns
        if c not in ("submission_id", "college_id", "would_recommend", "sentiment")
    ]
    if category_cols:
        df_wide["overall_rating"] = df_wide[category_cols].mean(axis=1)
    else:
        df_wide["overall_rating"] = 0.0

    # Drop rows with all-NaN category scores (edge case)
    df_wide = df_wide.dropna(subset=category_cols, how="all")

    return df_wide


def get_category_columns(df_wide: pd.DataFrame) -> list:
    """Returns the dynamic list of category column names from a wide DataFrame."""
    non_cat = {"submission_id", "college_id", "would_recommend", "sentiment", "overall_rating"}
    return [c for c in df_wide.columns if c not in non_cat]


def load_college_category_matrix() -> pd.DataFrame:
    """
    Returns a college × category matrix (mean score per college per category).
    Used by agglomerative clustering.
    """
    # Use pandas groupby for mean score per college per category
    qs = FeedbackFact.objects.values(
        "college_id", "category__category_name", "score"
    )
    df = pd.DataFrame.from_records(list(qs))
    if df.empty:
        return pd.DataFrame()

    matrix = df.groupby(
        ["college_id", "category__category_name"]
    )["score"].mean().unstack(fill_value=0)
    matrix.columns.name = None
    return matrix
