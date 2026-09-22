from rest_framework import serializers
from .models import College, Program, DateDim, FeedbackCategory, FeedbackFact, StudentProfile
from django.db.models import Avg

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'college_id', 'program_name', 'degree_type', 'subject_area']

class StudentRegistrationSerializer(serializers.ModelSerializer):
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), source='program', required=False, allow_null=True
    )
    admission_date = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, default="")
    age_group = serializers.CharField(required=False, allow_blank=True, default="")
    ageGroup = serializers.CharField(source='age_group', required=False, allow_blank=True)
    state_of_domicile = serializers.CharField(required=False, allow_blank=True, default="")
    stateOfDomicile = serializers.CharField(source='state_of_domicile', required=False, allow_blank=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user_id', 'program_id', 'admission_date', 'year_of_study',
            'age_group', 'ageGroup', 'gender', 'state_of_domicile', 'stateOfDomicile'
        ]

    def to_internal_value(self, data):
        mutable = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'ageGroup' in mutable and 'age_group' not in mutable:
            mutable['age_group'] = mutable['ageGroup']
        if 'stateOfDomicile' in mutable and 'state_of_domicile' not in mutable:
            mutable['state_of_domicile'] = mutable['stateOfDomicile']
        if 'programId' in mutable and 'program_id' not in mutable:
            mutable['program_id'] = mutable['programId']
        if 'admissionDate' in mutable and 'admission_date' not in mutable:
            mutable['admission_date'] = mutable['admissionDate']
        if 'userId' in mutable and 'user_id' not in mutable:
            mutable['user_id'] = mutable['userId']
        return super().to_internal_value(mutable)

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
    program_id = serializers.IntegerField(required=False, allow_null=True)
    studentYear = serializers.CharField(required=False, allow_blank=True)
    student_year = serializers.CharField(required=False, allow_blank=True)
    admissionDate = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    admission_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, default="")
    ageGroup = serializers.CharField(required=False, allow_blank=True, default="")
    age_group = serializers.CharField(required=False, allow_blank=True, default="")
    stateOfDomicile = serializers.CharField(required=False, allow_blank=True, default="")
    state_of_domicile = serializers.CharField(required=False, allow_blank=True, default="")
    ratings = serializers.JSONField()
    wouldRecommend = serializers.BooleanField(required=False)
    would_recommend = serializers.CharField(required=False, allow_blank=True)
    userId = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    user_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    positiveFeedback = serializers.CharField(allow_blank=True, required=False, default="")
    complaints = serializers.CharField(allow_blank=True, required=False, default="")
    suggestions = serializers.CharField(allow_blank=True, required=False, default="")

    def validate(self, attrs):
        # Normalize programId
        if not attrs.get('programId') and attrs.get('program_id'):
            attrs['programId'] = attrs['program_id']

        # Normalize studentYear
        if not attrs.get('studentYear') and attrs.get('student_year'):
            attrs['studentYear'] = attrs['student_year']

        # Normalize admissionDate
        if not attrs.get('admissionDate') and attrs.get('admission_date'):
            attrs['admissionDate'] = attrs['admission_date']

        # Normalize ageGroup
        if not attrs.get('age_group') and attrs.get('ageGroup'):
            attrs['age_group'] = attrs['ageGroup']
        elif not attrs.get('ageGroup') and attrs.get('age_group'):
            attrs['ageGroup'] = attrs['age_group']

        # Normalize stateOfDomicile
        if not attrs.get('state_of_domicile') and attrs.get('stateOfDomicile'):
            attrs['state_of_domicile'] = attrs['stateOfDomicile']
        elif not attrs.get('stateOfDomicile') and attrs.get('state_of_domicile'):
            attrs['stateOfDomicile'] = attrs['state_of_domicile']

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
        # Support array of category score objects: [{"category": "...", "score": 5}, ...]
        if isinstance(value, list):
            norm = {}
            for item in value:
                if isinstance(item, dict):
                    cat_name = item.get('category') or item.get('category_name') or item.get('name')
                    score = item.get('score')
                    if cat_name and score is not None:
                        norm[cat_name] = score
            value = norm

        if not isinstance(value, dict) or len(value) == 0:
            raise serializers.ValidationError("Ratings must be a non-empty dictionary or array of category scores.")

        for k, v in value.items():
            try:
                score_num = int(v)
                if not (1 <= score_num <= 5):
                    raise serializers.ValidationError(f"Rating for '{k}' must be between 1 and 5 (got {v}).")
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Rating for '{k}' must be a valid number between 1 and 5.")

        return value
