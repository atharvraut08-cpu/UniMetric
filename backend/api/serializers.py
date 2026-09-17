from rest_framework import serializers
from .models import College, Program, DateDim, FeedbackCategory, FeedbackFact
from django.db.models import Avg

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'college_id', 'program_name', 'degree_type', 'subject_area']

class CollegeListSerializer(serializers.ModelSerializer):
    # Map to frontend expected names
    type = serializers.CharField(source='college_type')
    programs = serializers.SerializerMethodField()
    overallRating = serializers.SerializerMethodField()
    totalReviews = serializers.SerializerMethodField()
    recommendationPercent = serializers.SerializerMethodField()

    class Meta:
        model = College
        fields = ['id', 'name', 'location', 'type', 'programs', 'overallRating', 'totalReviews', 'recommendationPercent']

    def get_programs(self, obj):
        return [p.program_name for p in obj.programs.all()]

    def get_overallRating(self, obj):
        if not hasattr(obj, 'avg_score'):
            return 0
        return round(obj.avg_score or 0, 1)

    def get_totalReviews(self, obj):
        if not hasattr(obj, 'unique_reviews'):
            return 0
        return obj.unique_reviews

    def get_recommendationPercent(self, obj):
        if not hasattr(obj, 'recommend_pct'):
            return 0
        return int(obj.recommend_pct or 0)

class ReviewSubmitSerializer(serializers.Serializer):
    collegeId = serializers.CharField()
    programId = serializers.IntegerField(required=False, allow_null=True)
    studentYear = serializers.CharField()
    ratings = serializers.DictField(child=serializers.IntegerField())
    wouldRecommend = serializers.BooleanField(required=False)
    would_recommend = serializers.CharField(required=False, allow_blank=True)
    positiveFeedback = serializers.CharField(allow_blank=True, required=False, default="")
    complaints = serializers.CharField(allow_blank=True, required=False, default="")
    suggestions = serializers.CharField(allow_blank=True, required=False, default="")

    def validate(self, attrs):
        # Normalize wouldRecommend from either wouldRecommend (bool) or would_recommend ('Y'/'N'/bool)
        if 'wouldRecommend' not in attrs:
            raw = attrs.get('would_recommend')
            if raw is not None:
                if isinstance(raw, bool):
                    attrs['wouldRecommend'] = raw
                elif str(raw).strip().upper() in ('Y', 'YES', 'TRUE', '1'):
                    attrs['wouldRecommend'] = True
                else:
                    attrs['wouldRecommend'] = False
            else:
                attrs['wouldRecommend'] = True
        return attrs

    def validate_ratings(self, value):
        required_keys = ['teachingQuality', 'labs', 'wifi', 'hostel', 'careerPlacements']
        for k in required_keys:
            if k not in value:
                raise serializers.ValidationError(f"Missing rating for {k}")
            if not (1 <= value[k] <= 5):
                raise serializers.ValidationError(f"Rating for {k} must be between 1 and 5")
        return value
