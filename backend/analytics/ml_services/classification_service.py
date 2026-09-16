"""
classification_service.py
Gaussian Naive Bayes: predict would_recommend from category scores.
Reuses the existing `sentiment` field as a one-hot encoded feature
(per PRD Section 2.4 — no NLP introduced).
"""
import numpy as np
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder


MIN_SAMPLES = 10


def train_classifier(df_wide: pd.DataFrame, category_columns: list) -> tuple[object, float]:
    """
    Fits GaussianNB on category scores + one-hot sentiment → would_recommend.
    Returns:
      - model: fitted GaussianNB (or None if insufficient data)
      - accuracy: float
    """
    df = df_wide[category_columns + ["would_recommend", "sentiment"]].dropna(
        subset=category_columns + ["would_recommend"]
    )

    if len(df) < MIN_SAMPLES:
        return None, 0.0

    # One-hot encode sentiment (POSITIVE / NEUTRAL / NEGATIVE)
    sentiment_dummies = pd.get_dummies(
        df["sentiment"].fillna("NEUTRAL"), prefix="sent", dtype=float
    )

    X = pd.concat([df[category_columns].reset_index(drop=True),
                   sentiment_dummies.reset_index(drop=True)], axis=1)
    y = df["would_recommend"].astype(int).values

    if len(df) >= 20:
        X_train, X_test, y_train, y_test = train_test_split(
            X.values, y, test_size=0.2, random_state=42, stratify=y
        )
    else:
        X_train, X_test, y_train, y_test = X.values, X.values, y, y

    model = GaussianNB()
    model.fit(X_train, y_train)
    accuracy = accuracy_score(y_test, model.predict(X_test))

    return model, accuracy


def predict_recommend_score(model: object, df_wide: pd.DataFrame, category_columns: list) -> float:
    """
    Returns the average predicted probability of would_recommend=True
    across all submissions for a college (represents the college-level score).
    """
    if model is None or df_wide.empty:
        return None

    df = df_wide[category_columns + ["sentiment"]].dropna(subset=category_columns)
    if df.empty:
        return None

    sentiment_dummies = pd.get_dummies(
        df["sentiment"].fillna("NEUTRAL"), prefix="sent", dtype=float
    )

    X = pd.concat([df[category_columns].reset_index(drop=True),
                   sentiment_dummies.reset_index(drop=True)], axis=1)

    # Align columns to what model was trained on
    for col in model.theta_.shape[0:0]:  # no-op guard
        pass
    try:
        proba = model.predict_proba(X.values)
        # Index 1 = probability of True (would_recommend)
        classes = list(model.classes_)
        true_idx = classes.index(1) if 1 in classes else -1
        if true_idx >= 0:
            return float(np.mean(proba[:, true_idx]))
        return None
    except Exception:
        return None
