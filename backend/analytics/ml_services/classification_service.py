"""
classification_service.py
Supervised Classification Engine for UniMetric DWM platform.
Supports:
  1. Gaussian Naive Bayes: probabilistic recommendation likelihood predictor.
  2. Decision Tree Classifier (ID3/CART): rule-based classifier with attribute relevance
     (top 3 most important features based on Gini/Information Gain).
  3. Classification Comparison: side-by-side accuracy evaluation.
"""
import numpy as np
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


MIN_SAMPLES = 10


SENTIMENT_COLUMNS = ["sent_NEGATIVE", "sent_NEUTRAL", "sent_POSITIVE"]


def train_classifier(df_wide: pd.DataFrame, category_columns: list) -> tuple:
    """
    Fits both GaussianNB and DecisionTreeClassifier on category scores + one-hot sentiment -> would_recommend.
    Returns:
      - gnb_model: fitted GaussianNB (or None)
      - gnb_accuracy: float
      - dt_model: fitted DecisionTreeClassifier (or None)
      - dt_accuracy: float
      - dt_top_features: list of dicts [{"feature": str, "importance": float, "percentage": float}] (top 3)
    """
    df = df_wide[category_columns + ["would_recommend", "sentiment"]].dropna(
        subset=category_columns + ["would_recommend"]
    )

    if len(df) < MIN_SAMPLES:
        return None, 0.0, None, 0.0, []

    # One-hot encode sentiment (POSITIVE / NEUTRAL / NEGATIVE)
    sentiment_dummies = pd.get_dummies(
        df["sentiment"].fillna("NEUTRAL"), prefix="sent", dtype=float
    ).reindex(columns=SENTIMENT_COLUMNS, fill_value=0.0)

    X = pd.concat([df[category_columns].reset_index(drop=True),
                   sentiment_dummies.reset_index(drop=True)], axis=1)
    y = df["would_recommend"].astype(int).values

    if len(df) >= 20:
        X_train, X_test, y_train, y_test = train_test_split(
            X.values, y, test_size=0.2, random_state=42, stratify=y
        )
    else:
        X_train, X_test, y_train, y_test = X.values, X.values, y, y

    # 1. Fit Gaussian Naive Bayes
    gnb_model = GaussianNB()
    gnb_model.fit(X_train, y_train)
    gnb_accuracy = float(accuracy_score(y_test, gnb_model.predict(X_test)))

    # 2. Fit Decision Tree Classifier (entropy / Information Gain)
    dt_model = DecisionTreeClassifier(criterion="entropy", max_depth=4, random_state=42)
    dt_model.fit(X_train, y_train)
    dt_accuracy = float(accuracy_score(y_test, dt_model.predict(X_test)))

    # 3. Extract Top 3 Most Important Features (Attribute Relevance)
    importances = dt_model.feature_importances_
    feature_names = list(X.columns)
    sorted_idx = np.argsort(importances)[::-1]
    
    dt_top_features = []
    for idx in sorted_idx[:3]:
        raw_name = feature_names[idx]
        clean_name = (
            raw_name.replace("sent_POSITIVE", "Positive Sentiment")
                    .replace("sent_NEGATIVE", "Negative Sentiment")
                    .replace("sent_NEUTRAL", "Neutral Sentiment")
        )
        dt_top_features.append({
            "feature": clean_name,
            "importance": round(float(importances[idx]), 3),
            "percentage": round(float(importances[idx]) * 100, 1),
        })

    return gnb_model, gnb_accuracy, dt_model, dt_accuracy, dt_top_features


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

    # Always emit all three sentiment columns so the feature layout matches training,
    # even when a college has no reviews of a given sentiment.
    sentiment_dummies = pd.get_dummies(
        df["sentiment"].fillna("NEUTRAL"), prefix="sent", dtype=float
    ).reindex(columns=SENTIMENT_COLUMNS, fill_value=0.0)

    X = pd.concat([df[category_columns].reset_index(drop=True),
                   sentiment_dummies.reset_index(drop=True)], axis=1)

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
