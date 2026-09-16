from rest_framework import viewsets, views, status
from rest_framework.response import Response
from django.db.models import Avg, Count, Q, F, ExpressionWrapper
from django.db.models.functions import Cast
from django.db.models import FloatField, IntegerField
from .models import College, Program, StudentProfile, DateDim, FeedbackCategory, FeedbackFact
from .serializers import CollegeListSerializer, ProgramSerializer, ReviewSubmitSerializer
from datetime import date

class CollegeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CollegeListSerializer

    def get_queryset(self):
        queryset = College.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(location__icontains=search) | 
                Q(college_type__icontains=search) |
                Q(programs__program_name__icontains=search)
            ).distinct()

        # Annotate overall stats
        # Total unique submissions
        queryset = queryset.annotate(
            unique_reviews=Count('feedback__submission_id', distinct=True)
        )
        # Average score across all facts
        queryset = queryset.annotate(
            avg_score=Avg('feedback__score')
        )
        # Recommendation percent: cast boolean → integer (0/1), then AVG, then × 100
        # PostgreSQL cannot directly AVG a boolean; it can AVG an integer.
        queryset = queryset.annotate(
            recommend_pct=ExpressionWrapper(
                Avg(Cast('feedback__would_recommend', IntegerField())) * 100,
                output_field=FloatField(),
            )
        )

        return queryset

class CollegeSummaryView(views.APIView):
    def get(self, request, id):
        try:
            college = College.objects.get(id=id)
        except College.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        return Response(self._get_summary(college))

    def _get_summary(self, college):
        facts = FeedbackFact.objects.filter(college=college)
        total_reviews = facts.values('submission_id').distinct().count()
        if total_reviews == 0:
            return self._empty_summary(college)
        
        overall_avg = facts.aggregate(avg=Avg('score'))['avg']
        
        # Calculate category averages
        cat_avgs = facts.values('category__category_name').annotate(avg_score=Avg('score'))
        cat_dict = {item['category__category_name']: round(item['avg_score'], 1) for item in cat_avgs}

        # Calculate recommendation percent
        # Get one fact per submission to avoid over-counting if we count manually
        submissions = facts.distinct('submission_id')
        recommends = sum(1 for s in submissions if s.would_recommend)
        recommend_pct = int((recommends / total_reviews) * 100) if total_reviews > 0 else 0

        # Sentiment counts
        positive = sum(1 for s in submissions if s.sentiment.upper() == 'POSITIVE')
        neutral = sum(1 for s in submissions if s.sentiment.upper() == 'NEUTRAL')
        negative = sum(1 for s in submissions if s.sentiment.upper() == 'NEGATIVE')

        # Feedback texts
        pos_feedbacks = [s.positive_feedback for s in submissions if s.positive_feedback]
        complaints = [s.complaints for s in submissions if s.complaints]
        suggestions = [s.suggestions for s in submissions if s.suggestions]

        return {
            "id": college.id,
            "name": college.name,
            "location": college.location,
            "type": college.get_college_type_display(),
            "programs": [p.program_name for p in college.programs.all()],
            "overallRating": round(overall_avg, 1) if overall_avg else 0,
            "totalReviews": total_reviews,
            "recommendationPercent": recommend_pct,
            "ratings": {
                "teachingQuality": cat_dict.get('Teaching Quality', 0),
                "infrastructure": {
                    "labs": cat_dict.get('Labs', 0),
                    "wifi": cat_dict.get('Wi-Fi', 0),
                    "hostel": cat_dict.get('Hostel', 0),
                    "overall": round((cat_dict.get('Labs', 0) + cat_dict.get('Wi-Fi', 0) + cat_dict.get('Hostel', 0)) / 3, 2)
                },
                "careerPlacements": cat_dict.get('Career Placements', 0)
            },
            "sentimentDistribution": {
                "positive": positive,
                "neutral": neutral,
                "negative": negative
            },
            "feedback": {
                "positive": pos_feedbacks[:10],
                "complaints": complaints[:10],
                "suggestions": suggestions[:10]
            }
        }

    def _empty_summary(self, college):
        return {
            "id": college.id,
            "name": college.name,
            "location": college.location,
            "type": college.get_college_type_display(),
            "programs": [p.program_name for p in college.programs.all()],
            "overallRating": 0,
            "totalReviews": 0,
            "recommendationPercent": 0,
            "ratings": {
                "teachingQuality": 0,
                "infrastructure": { "labs": 0, "wifi": 0, "hostel": 0, "overall": 0 },
                "careerPlacements": 0
            },
            "sentimentDistribution": { "positive": 0, "neutral": 0, "negative": 0 },
            "feedback": { "positive": [], "complaints": [], "suggestions": [] }
        }

class CollegeCompareView(views.APIView):
    def get(self, request):
        ids_str = request.query_params.get('ids', '')
        if not ids_str:
            return Response([])
        
        try:
            ids = [int(i) for i in ids_str.split(',')]
        except ValueError:
            return Response({"error": "Invalid IDs"}, status=400)

        colleges = College.objects.filter(id__in=ids)
        summary_view = CollegeSummaryView()
        results = [summary_view._get_summary(c) for c in colleges]
        return Response(results)

class CollegeReviewsView(views.APIView):
    def get(self, request, id):
        try:
            college = College.objects.get(id=id)
        except College.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        # Get unique submissions
        submissions = FeedbackFact.objects.filter(college=college).distinct('submission_id')
        
        results = []
        for s in submissions:
            # Reconstruct the ratings dictionary for this submission
            facts = FeedbackFact.objects.filter(submission_id=s.submission_id)
            ratings = {}
            for f in facts:
                cat_name = f.category.category_name
                # Map back to frontend expected keys
                if cat_name == 'Teaching Quality': ratings['teachingQuality'] = f.score
                elif cat_name == 'Labs': ratings['labs'] = f.score
                elif cat_name == 'Wi-Fi': ratings['wifi'] = f.score
                elif cat_name == 'Hostel': ratings['hostel'] = f.score
                elif cat_name == 'Career Placements': ratings['careerPlacements'] = f.score

            results.append({
                "id": str(s.submission_id),
                "collegeId": college.id,
                "studentYear": s.student_profile.get_year_of_study_display() if s.student_profile else "",
                "program": s.program.program_name if s.program else "",
                "ratings": ratings,
                "sentiment": s.sentiment.lower(),
                "comment": s.positive_feedback or s.complaints or s.suggestions
            })
            
        return Response(results)

class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProgramSerializer
    queryset = Program.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        college_id = self.request.query_params.get('college_id')
        if college_id:
            qs = qs.filter(college_id=college_id)
        return qs

class SubmitReviewView(views.APIView):
    def post(self, request):
        serializer = ReviewSubmitSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                college = College.objects.get(id=data['collegeId'])
            except College.DoesNotExist:
                return Response({"error": "College not found"}, status=400)
                
            program = None
            if data.get('programId'):
                try:
                    program = Program.objects.get(id=data['programId'])
                except Program.DoesNotExist:
                    pass

            # Create Student Profile
            student_profile = StudentProfile.objects.create(
                year_of_study=data['studentYear']
            )

            # Get or Create DateDim
            today = date.today()
            date_dim, _ = DateDim.objects.get_or_create(
                full_date=today,
                defaults={
                    'year': today.year,
                    'quarter': (today.month - 1) // 3 + 1,
                    'month': today.month,
                    'academic_year': f"{today.year}-{today.year+1}"
                }
            )

            # Define category mappings
            cat_map = {
                'teachingQuality': 'Teaching Quality',
                'labs': 'Labs',
                'wifi': 'Wi-Fi',
                'hostel': 'Hostel',
                'careerPlacements': 'Career Placements'
            }

            import uuid
            submission_id = uuid.uuid4()

            # Create 5 FeedbackFact rows
            for key, score in data['ratings'].items():
                cat_name = cat_map.get(key)
                if not cat_name: continue
                
                category, _ = FeedbackCategory.objects.get_or_create(
                    category_name=cat_name,
                    defaults={'category_group': 'INFRASTRUCTURE'} # simplified fallback
                )
                
                FeedbackFact.objects.create(
                    college=college,
                    program=program,
                    student_profile=student_profile,
                    date=date_dim,
                    category=category,
                    score=score,
                    submission_id=submission_id,
                    would_recommend=data['wouldRecommend'],
                    sentiment="POSITIVE", # Hardcoded or basic inference since ML is out of scope
                    positive_feedback=data['positiveFeedback'],
                    complaints=data['complaints'],
                    suggestions=data['suggestions']
                )

            return Response({"status": "success", "submission_id": str(submission_id)}, status=201)
        return Response(serializer.errors, status=400)
