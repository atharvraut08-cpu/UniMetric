"""
regression_service.py
Ridge Regression: quantify how much each category score drives overall_rating.
Outputs standardized coefficients → "Key Drivers" ranking.
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score


MIN_SAMPLES = 5  # Minimum samples required to train


def train_regression(df_wide: pd.DataFrame, category_columns: list) -> tuple[dict, object, float]:
    """
    Fits Ridge regression (category scores → overall_rating).
    Returns:
      - impact_dict: {category: standardized_coef}, sorted descending by abs value
      - model: fitted Ridge instance
      - r2: R² score on test split
    """
    # Fill any NaN scores with the column mean
    df = df_wide[category_columns + ["overall_rating"]].dropna()

    if len(df) < MIN_SAMPLES:
        return {}, None, 0.0

    X = df[category_columns].values
    y = df["overall_rating"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    if len(df) >= 10:
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
    else:
        X_train, X_test, y_train, y_test = X_scaled, X_scaled, y, y

    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)

    r2 = r2_score(y_test, model.predict(X_test))

    impact_dict = dict(zip(category_columns, model.coef_.tolist()))
    # Sort by absolute coefficient descending
    impact_dict = dict(
        sorted(impact_dict.items(), key=lambda x: abs(x[1]), reverse=True)
    )

    return impact_dict, model, r2
