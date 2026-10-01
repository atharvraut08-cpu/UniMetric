"""
clustering_service.py

K-Means: Segment student reviews into 3 groups per college.
  k=3 matches the proposal segments:
    - "Highly Satisfied"         → cluster with highest overall centroid mean
    - "Infrastructure-Critical"  → cluster with lowest infrastructure-column mean
    - "Academically Challenged"  → cluster with lowest teaching/academic column mean
  k is configurable here as a constant. A production phase could use elbow method to auto-select.

Agglomerative: Group similar categories across colleges into super-factors.
  Input: college × category matrix (mean score per college per category).
  Transposes to cluster categories (not colleges).
"""
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.preprocessing import StandardScaler


K_MEANS_K = 3
MIN_SAMPLES_KMEANS = K_MEANS_K  # need at least k samples


# Heuristic keywords to classify cluster labels
INFRA_KEYWORDS = ["lab", "wi-fi", "wifi", "hostel", "infra", "internet", "facility", "canteen", "amenities", "cleanliness", "equipment"]
TEACHING_KEYWORDS = ["teaching", "course", "academic", "faculty", "class", "curriculum", "library"]
CAREER_KEYWORDS = ["placement", "career", "extracurricular", "culture", "opportunity", "club"]


def _matches_keywords(col_name: str, keywords: list) -> bool:
    return any(kw in col_name.lower() for kw in keywords)


def _label_clusters(model: KMeans, category_columns: list) -> dict:
    """
    Assign human-readable label to each cluster ID by inspecting centroids.
    Returns {cluster_id: label_string}
    """
    centers = model.cluster_centers_  # shape (k, n_features)

    # Compute per-cluster mean across all features
    overall_means = centers.mean(axis=1)

    infra_cols_idx = [
        i for i, c in enumerate(category_columns)
        if _matches_keywords(c, INFRA_KEYWORDS)
    ]
    teaching_cols_idx = [
        i for i, c in enumerate(category_columns)
        if _matches_keywords(c, TEACHING_KEYWORDS)
    ]

    # Fallback: if no matching columns found, use overall mean ranking
    if infra_cols_idx:
        infra_means = centers[:, infra_cols_idx].mean(axis=1)
    else:
        infra_means = overall_means.copy()

    if teaching_cols_idx:
        teaching_means = centers[:, teaching_cols_idx].mean(axis=1)
    else:
        teaching_means = overall_means.copy()

    # Label each cluster
    labels = {}
    # Highest overall → Highly Satisfied
    best_cluster = int(np.argmax(overall_means))
    labels[best_cluster] = "Highly Satisfied"

    # Among remaining: lowest infra → Infrastructure-Critical
    remaining = [i for i in range(K_MEANS_K) if i != best_cluster]
    infra_critical = min(remaining, key=lambda i: infra_means[i])
    labels[infra_critical] = "Infrastructure-Critical"

    # Whatever's left → Academically Challenged
    for i in range(K_MEANS_K):
        if i not in labels:
            labels[i] = "Academically Challenged"

    return labels


def run_kmeans(df_wide: pd.DataFrame, category_columns: list) -> tuple[list, dict]:
    """
    Runs K-Means (k=3) on standardized category scores.
    Returns:
      - labels: list of cluster ints, one per row in df_wide
      - label_map: {cluster_int: descriptive_string}
    """
    cols = [c for c in category_columns if c in df_wide.columns]
    if not cols:
        return [], {}

    df = df_wide[cols].copy()
    for col in cols:
        mean_val = df[col].mean()
        if pd.isna(mean_val):
            mean_val = 3.0
        df[col] = df[col].fillna(mean_val)

    if len(df) < MIN_SAMPLES_KMEANS:
        return [], {}

    scaler = StandardScaler()
    X = scaler.fit_transform(df.values)

    k = min(K_MEANS_K, len(df))
    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    raw_labels = model.fit_predict(X)

    label_map = _label_clusters(model, cols)
    return raw_labels.tolist(), label_map


def cluster_summary_for_college(df_wide: pd.DataFrame, category_columns: list) -> list:
    """
    Returns the cluster distribution for a single college as a list of dicts:
    [{segment, count, percent}, ...]
    """
    raw_labels, label_map = run_kmeans(df_wide, category_columns)
    if not raw_labels:
        return []

    total = len(raw_labels)
    summary = []
    for cluster_id, segment_name in label_map.items():
        count = raw_labels.count(cluster_id)
        summary.append({
            "segment": segment_name,
            "count": count,
            "percent": round((count / total) * 100),
        })

    return sorted(summary, key=lambda x: x["count"], reverse=True)


def run_agglomerative(
    data: pd.DataFrame,
    n_clusters: int = 3,
    category_columns: list = None,
) -> list:
    """
    Runs agglomerative hierarchical clustering (Ward's linkage) on categories.
    Outputs a simplified hierarchical structure of top-level cluster splits
    that can be easily parsed and displayed by the frontend.
    """
    if data is None or data.empty:
        return []

    if category_columns:
        cols = [c for c in category_columns if c in data.columns]
    else:
        cols = list(data.columns)

    if not cols:
        return []

    actual_clusters = min(n_clusters, len(cols))
    if actual_clusters < 1:
        return []

    # Transpose so rows = categories, columns = samples/colleges
    df_clean = data[cols].copy()
    for col in cols:
        df_clean[col] = df_clean[col].fillna(df_clean[col].mean())

    X = df_clean.T.values
    if len(X) < actual_clusters:
        return []

    model = AgglomerativeClustering(n_clusters=actual_clusters, linkage="ward")
    cluster_ids = model.fit_predict(X)

    from collections import defaultdict
    groups = defaultdict(list)
    for cat, cid in zip(cols, cluster_ids):
        groups[int(cid)].append(cat)

    split_prefixes = ["Branch A", "Branch B", "Branch C", "Branch D", "Branch E"]
    result = []

    for i, (cid, cats) in enumerate(groups.items()):
        prefix = split_prefixes[i % len(split_prefixes)]
        
        # Count keyword matches to pick dominant theme
        teach_count = sum(1 for c in cats if _matches_keywords(c, TEACHING_KEYWORDS))
        career_count = sum(1 for c in cats if _matches_keywords(c, CAREER_KEYWORDS))
        infra_count = sum(1 for c in cats if _matches_keywords(c, INFRA_KEYWORDS))

        if teach_count >= infra_count and teach_count >= career_count and teach_count > 0:
            theme = "Academic Pedagogy & Curriculum"
            group_name = "Academic Factor"
            summary = "Course curriculum rigor, faculty teaching quality, and library"
        elif career_count >= infra_count and career_count > 0:
            theme = "Career Pathways & Campus Culture"
            group_name = "Outcome Factor"
            summary = "Placement packages, industry drives, and student clubs"
        elif infra_count > 0:
            theme = "Infrastructure & Campus Living"
            group_name = "Infrastructure Factor"
            summary = "Physical amenities, housing, hygiene, and connectivity"
        else:
            theme = f"Factor Cluster {cid + 1}"
            group_name = f"Cluster Factor {cid + 1}"
            summary = "Complementary student experience evaluation dimensions"

        # Compute average score across this split if data contains score columns
        try:
            split_avg = round(float(data[cats].mean().mean()), 2)
        except Exception:
            split_avg = None

        result.append({
            "split_name": f"{prefix}: {theme}",
            "group": group_name,
            "theme": theme,
            "cluster_id": cid,
            "categories": cats,
            "category_count": len(cats),
            "average_score": split_avg,
            "summary": summary,
        })

    return sorted(result, key=lambda x: x["cluster_id"])

