from rest_framework import serializers
from .models import CollegeInsightCache, GlobalInsightCache


class CollegeInsightSerializer(serializers.ModelSerializer):
    collegeId = serializers.IntegerField(source="college_id")
    keyDrivers = serializers.JSONField(source="key_drivers")
    clusterSummary = serializers.JSONField(source="cluster_summary")
    associationRules = serializers.JSONField(source="association_rules")
    predictiveRecommendScore = serializers.FloatField(source="predictive_recommend_score")
    classifierAccuracy = serializers.FloatField(source="classifier_accuracy")
    computedAt = serializers.DateTimeField(source="computed_at")

    class Meta:
        model = CollegeInsightCache
        fields = [
            "collegeId",
            "keyDrivers",
            "clusterSummary",
            "associationRules",
            "predictiveRecommendScore",
            "classifierAccuracy",
            "computedAt",
        ]


class GlobalInsightSerializer(serializers.ModelSerializer):
    categoryClusters = serializers.JSONField(source="category_clusters")
    crossCollegeRules = serializers.JSONField(source="cross_college_rules")
    computedAt = serializers.DateTimeField(source="computed_at")

    class Meta:
        model = GlobalInsightCache
        fields = [
            "categoryClusters",
            "crossCollegeRules",
            "computedAt",
        ]
