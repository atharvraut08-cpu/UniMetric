from django.db import models


class CollegeInsightCache(models.Model):
    """
    Pre-computed ML analytics results for a single college.
    Populated by `python manage.py run_analytics_pipeline`.
    API views only ever READ from this table.
    """
    college = models.OneToOneField(
        "api.College",
        on_delete=models.CASCADE,
        related_name="insight_cache",
    )
    # Ridge regression: {category_name: impact_coefficient}
    key_drivers = models.JSONField(default=list)
    # K-Means cluster distribution: [{segment, count, percent}]
    cluster_summary = models.JSONField(default=list)
    # Top Apriori rules: [{rule, confidence, lift}]
    association_rules = models.JSONField(default=list)
    # GaussianNB predict_proba for would_recommend=True, averaged across college
    predictive_recommend_score = models.FloatField(null=True, blank=True)
    # Accuracy on held-out test split (GaussianNB)
    classifier_accuracy = models.FloatField(null=True, blank=True)
    # Decision Tree Classifier metrics
    decision_tree_accuracy = models.FloatField(null=True, blank=True)
    decision_tree_top_features = models.JSONField(default=list)
    # Agglomerative Hierarchical Groupings (simplified top-level splits)
    hierarchical_groupings = models.JSONField(default=list)
    computed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"InsightCache for {self.college}"


class GlobalInsightCache(models.Model):
    """
    Pre-computed global analytics (agglomerative clustering + cross-college Apriori).
    Singleton row keyed by singleton_key='GLOBAL'.
    """
    singleton_key = models.CharField(max_length=20, unique=True, default="GLOBAL")
    # Agglomerative: [{group: str, categories: [str]}]
    category_clusters = models.JSONField(default=list)
    # Global Apriori rules: [{rule, confidence, lift}]
    cross_college_rules = models.JSONField(default=list)
    computed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "GlobalInsightCache"
