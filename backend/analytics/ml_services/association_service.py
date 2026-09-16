"""
association_service.py
Apriori association rule mining on binarized low-rating patterns.

Step 1: Binarize — for each category column, derive boolean "Low_<Category>" (score <= 2)
        and "No_Recommend" flag (would_recommend == False).
Step 2: Build one-hot transaction DataFrame.
Step 3: Run mlxtend apriori + association_rules.
Step 4: Return top rules as human-readable strings.
"""
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules as arm


MIN_TRANSACTIONS = 5
LOW_THRESHOLD = 2  # score <= 2 is considered "Low"


def _binarize(df_wide: pd.DataFrame, category_columns: list) -> pd.DataFrame:
    """Creates a boolean transaction DataFrame for Apriori."""
    transactions = pd.DataFrame()

    for col in category_columns:
        col_data = df_wide[col].fillna(df_wide[col].mean())
        transactions[f"Low_{col}"] = (col_data <= LOW_THRESHOLD).astype(bool)

    transactions["No_Recommend"] = (~df_wide["would_recommend"].astype(bool))
    return transactions


def mine_association_rules(
    df_wide: pd.DataFrame,
    category_columns: list,
    min_support: float = 0.05,
    min_confidence: float = 0.4,
    top_n: int = 5,
) -> list:
    """
    Mines association rules from binarized low-rating flags.
    Returns top_n rules as dicts: {rule, confidence, lift}
    """
    if len(df_wide) < MIN_TRANSACTIONS:
        return []

    transactions = _binarize(df_wide, category_columns)

    # mlxtend apriori requires bool dtype
    transactions = transactions.astype(bool)

    try:
        frequent_itemsets = apriori(
            transactions,
            min_support=min_support,
            use_colnames=True,
        )
    except Exception:
        return []

    if frequent_itemsets.empty:
        return []

    try:
        rules = arm(
            frequent_itemsets,
            metric="confidence",
            min_threshold=min_confidence,
        )
    except Exception:
        return []

    if rules.empty:
        return []

    rules = rules.sort_values("lift", ascending=False)

    result = []
    for _, row in rules.head(top_n).iterrows():
        antecedents = " + ".join(sorted(row["antecedents"]))
        consequents = " + ".join(sorted(row["consequents"]))

        # Make human-readable: "Low_Teaching Quality" → "Low Teaching Quality"
        def clean(s):
            return s.replace("Low_", "Low ").replace("No_", "No ")

        rule_str = f"{clean(antecedents)} → {clean(consequents)}"

        result.append({
            "rule": rule_str,
            "confidence": round(float(row["confidence"]), 3),
            "lift": round(float(row["lift"]), 3),
            "support": round(float(row["support"]), 3),
        })

    return result
