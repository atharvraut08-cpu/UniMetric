"""
model_registry.py
Save and load trained model artifacts via joblib.
All artifacts stored in analytics/artifacts/ directory.
"""
import os
import joblib
from pathlib import Path

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)


def save_model(name: str, obj) -> str:
    """Persist a model/object to disk. Returns the artifact path."""
    path = ARTIFACTS_DIR / f"{name}.pkl"
    joblib.dump(obj, path)
    return str(path)


def load_model(name: str):
    """Load a persisted model. Returns None if not found."""
    path = ARTIFACTS_DIR / f"{name}.pkl"
    if path.exists():
        return joblib.load(path)
    return None
