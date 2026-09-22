from rest_framework import viewsets, views, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Avg, Count, Q, F, ExpressionWrapper
from django.db.models.functions import Cast
from django.db.models import FloatField, IntegerField
from .models import College, Program, StudentProfile, DateDim, FeedbackCategory, FeedbackFact
from .serializers import (
    CollegeListSerializer, 
    ProgramSerializer, 
    ReviewSubmitSerializer, 
    StudentRegistrationSerializer
)
from datetime import date, datetime
from django.utils import timezone

def calculate_year_of_study(admission_date, reference_date=None):
    """
    Calculate current Year of Study ("1", "2", "3", "4") based on admission_date and reference_date.
    - 0 <= elapsed months < 12 -> "1"
    - 12 <= elapsed months < 24 -> "2"
    - 24 <= elapsed months < 36 -> "3"
    - elapsed months >= 36 -> "4"
    """
    if not admission_date:
        return "1"

    if reference_date is None:
        reference_date = timezone.now().date()
    elif isinstance(reference_date, datetime):
        reference_date = reference_date.date()

    if isinstance(admission_date, str):
        raw = admission_date.strip()
        try:
            if len(raw) == 7:  # YYYY-MM format from <input type="month" />
                parsed = datetime.strptime(raw, "%Y-%m").date()
            else:
                parsed = datetime.strptime(raw[:10], "%Y-%m-%d").date()
        except Exception:
            return "1"
    elif isinstance(admission_date, datetime):
        parsed = admission_date.date()
    elif isinstance(admission_date, date):
        parsed = admission_date
    else:
        return "1"

    months_diff = (reference_date.year - parsed.year) * 12 + (reference_date.month - parsed.month)
    if months_diff < 0:
        return "1"

    calc_year = (months_diff // 12) + 1
    return str(min(max(calc_year, 1), 4))

class CollegeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CollegeListSerializer
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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
                    "labs": cat_dict.get('Infra — Quality of Equipment') or cat_dict.get('Labs', 0),
                    "wifi": cat_dict.get('Wi-Fi & Connectivity') or cat_dict.get('Wi-Fi', 0),
                    "hostel": cat_dict.get('Hostel & Accommodation') or cat_dict.get('Hostel', 0),
                    "overall": round(
                        (
                            (cat_dict.get('Infra — Quality of Equipment') or cat_dict.get('Labs', 0)) +
                            (cat_dict.get('Wi-Fi & Connectivity') or cat_dict.get('Wi-Fi', 0)) +
                            (cat_dict.get('Hostel & Accommodation') or cat_dict.get('Hostel', 0))
                        ) / 3, 2
                    )
                },
                "careerPlacements": cat_dict.get('Placements & Opportunities') or cat_dict.get('Career Placements', 0),
                "detailed": cat_dict
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
                "careerPlacements": 0,
                "detailed": {}
            },
            "sentimentDistribution": { "positive": 0, "neutral": 0, "negative": 0 },
            "feedback": { "positive": [], "complaints": [], "suggestions": [] }
        }

class CollegeCompareView(views.APIView):
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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
                if cat_name in ('Teaching Quality',):
                    ratings['teachingQuality'] = f.score
                elif cat_name in ('Infra — Quality of Equipment', 'Labs'):
                    ratings['labs'] = f.score
                elif cat_name in ('Wi-Fi & Connectivity', 'Wi-Fi'):
                    ratings['wifi'] = f.score
                elif cat_name in ('Hostel & Accommodation', 'Hostel'):
                    ratings['hostel'] = f.score
                elif cat_name in ('Placements & Opportunities', 'Career Placements'):
                    ratings['careerPlacements'] = f.score
                ratings[cat_name] = f.score

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
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        college_id = self.request.query_params.get('college_id')
        if college_id:
            qs = qs.filter(college_id=college_id)
        return qs

class SubmitReviewView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"has_submitted": False, "hasSubmitted": False, "count": 0})

        # Fetch student profile to get admission_date or year_of_study
        profile = StudentProfile.objects.filter(user_id=user_id).order_by('-id').first()

        # Check admission_date from query params or student profile
        admission_date_raw = request.query_params.get('admission_date')
        if not admission_date_raw and profile and profile.admission_date:
            admission_date_raw = profile.admission_date

        if admission_date_raw:
            current_year = calculate_year_of_study(admission_date_raw)
        elif profile and profile.year_of_study:
            current_year = profile.year_of_study
        else:
            current_year = request.query_params.get('year_of_study') or request.query_params.get('student_year') or "1"

        # Check if the user has submitted for this specific calculated year of study
        facts = FeedbackFact.objects.filter(
            Q(user_id=user_id) | Q(student_profile__user_id=user_id)
        )
        facts_for_year = facts.filter(student_profile__year_of_study=current_year)
        has_submitted = facts_for_year.exists()
        first_fact = facts_for_year.first() if has_submitted else facts.first()

        return Response({
            "has_submitted": has_submitted,
            "hasSubmitted": has_submitted,
            "current_year_of_study": current_year,
            "currentYearOfStudy": current_year,
            "college_id": first_fact.college_id if first_fact else (profile.program.college_id if profile and profile.program else None),
            "college_name": first_fact.college.name if first_fact and first_fact.college else (profile.program.college.name if profile and profile.program and profile.program.college else None),
            "submission_id": str(first_fact.submission_id) if first_fact else None,
            "count": 1 if has_submitted else 0,
        })

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

            uid = data.get('userId') or data.get('user_id') or ""

            # Check existing profile for admission_date or parse from payload
            profile = StudentProfile.objects.filter(user_id=uid).order_by('-id').first() if uid else None
            
            admission_raw = data.get('admissionDate') or (profile.admission_date if profile else None)
            if admission_raw:
                calculated_year = calculate_year_of_study(admission_raw)
            else:
                calculated_year = data.get('studentYear') or (profile.year_of_study if profile else "1")

            # Parse admission_date into a valid Date object if present
            parsed_admission_date = None
            if admission_raw:
                try:
                    raw_str = str(admission_raw).strip()
                    if len(raw_str) == 7:
                        parsed_admission_date = datetime.strptime(raw_str, "%Y-%m").date()
                    else:
                        parsed_admission_date = datetime.strptime(raw_str[:10], "%Y-%m-%d").date()
                except Exception:
                    parsed_admission_date = None

            # Check duplicate submission for THIS specific calculated year of study
            if uid:
                already_exists = FeedbackFact.objects.filter(
                    Q(user_id=uid) | Q(student_profile__user_id=uid),
                    student_profile__year_of_study=calculated_year
                ).exists()
                if already_exists:
                    return Response({
                        "error": f"You have already submitted a review for Year {calculated_year}. Students are limited to one review per academic year."
                    }, status=400)

            # Create Student Profile
            student_profile = StudentProfile.objects.create(
                year_of_study=calculated_year,
                user_id=uid,
                program=program or (profile.program if profile else None),
                admission_date=parsed_admission_date or (profile.admission_date if profile else None),
                gender=data.get('gender') or (profile.gender if profile else ""),
                age_group=data.get('age_group') or data.get('ageGroup') or (profile.age_group if profile else ""),
                state_of_domicile=data.get('state_of_domicile') or data.get('stateOfDomicile') or (profile.state_of_domicile if profile else "")
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

            # Define category mappings (supporting 11 categories and legacy aliases)
            cat_map = {
                # Legacy keys
                'teachingQuality': 'Teaching Quality',
                'labs': 'Infra — Quality of Equipment',
                'wifi': 'Wi-Fi & Connectivity',
                'hostel': 'Hostel & Accommodation',
                'careerPlacements': 'Placements & Opportunities',
                # Exact category names
                'Teaching Quality': 'Teaching Quality',
                'Curriculum Relevance': 'Curriculum Relevance',
                'Library & Resources': 'Library & Resources',
                'Infra — Quality of Equipment': 'Infra — Quality of Equipment',
                'Infra — Cleanliness': 'Infra — Cleanliness',
                'Infra — Basic Amenities': 'Infra — Basic Amenities',
                'Wi-Fi & Connectivity': 'Wi-Fi & Connectivity',
                'Canteen & Food Quality': 'Canteen & Food Quality',
                'Hostel & Accommodation': 'Hostel & Accommodation',
                'Placements & Opportunities': 'Placements & Opportunities',
                'Extracurriculars & Culture': 'Extracurriculars & Culture',
                # CamelCase aliases
                'curriculumRelevance': 'Curriculum Relevance',
                'libraryResources': 'Library & Resources',
                'infraEquipment': 'Infra — Quality of Equipment',
                'infraCleanliness': 'Infra — Cleanliness',
                'infraAmenities': 'Infra — Basic Amenities',
                'wifiConnectivity': 'Wi-Fi & Connectivity',
                'canteenFoodQuality': 'Canteen & Food Quality',
                'hostelAccommodation': 'Hostel & Accommodation',
                'placementsOpportunities': 'Placements & Opportunities',
                'extracurricularsCulture': 'Extracurriculars & Culture',
            }

            def get_category_group(cname):
                if cname in ['Teaching Quality', 'Curriculum Relevance', 'Library & Resources']:
                    return 'TEACHING'
                elif cname in ['Placements & Opportunities', 'Extracurriculars & Culture']:
                    return 'CAREER'
                return 'INFRASTRUCTURE'

            import uuid
            submission_id = uuid.uuid4()

            # Create FeedbackFact rows for all submitted ratings
            for key, score in data['ratings'].items():
                cat_name = cat_map.get(key) or key
                
                category, _ = FeedbackCategory.objects.get_or_create(
                    category_name=cat_name,
                    defaults={'category_group': get_category_group(cat_name)}
                )
                
                FeedbackFact.objects.create(
                    college=college,
                    program=program,
                    student_profile=student_profile,
                    date=date_dim,
                    category=category,
                    score=score,
                    submission_id=submission_id,
                    user_id=uid,
                    would_recommend=data['wouldRecommend'],
                    sentiment="POSITIVE", # Hardcoded or basic inference
                    positive_feedback=data['positiveFeedback'],
                    complaints=data['complaints'],
                    suggestions=data['suggestions']
                )

            return Response({
                "status": "success", 
                "submission_id": str(submission_id),
                "year_of_study": calculated_year
            }, status=201)
        return Response(serializer.errors, status=400)

class StudentRegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data.get('user_id')
            admission_date = serializer.validated_data.get('admission_date')
            program = serializer.validated_data.get('program')
            gender = serializer.validated_data.get('gender', '')
            age_group = serializer.validated_data.get('age_group', '')
            state_of_domicile = serializer.validated_data.get('state_of_domicile', '')
            
            year_of_study = calculate_year_of_study(admission_date) if admission_date else serializer.validated_data.get('year_of_study', '1')

            if uid:
                profile, _ = StudentProfile.objects.update_or_create(
                    user_id=uid,
                    defaults={
                        'program': program,
                        'admission_date': admission_date,
                        'year_of_study': year_of_study,
                        'gender': gender,
                        'age_group': age_group,
                        'state_of_domicile': state_of_domicile,
                    }
                )
            else:
                profile = StudentProfile.objects.create(
                    user_id=uid,
                    program=program,
                    admission_date=admission_date,
                    year_of_study=year_of_study,
                    gender=gender,
                    age_group=age_group,
                    state_of_domicile=state_of_domicile,
                )

            return Response(StudentRegistrationSerializer(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

