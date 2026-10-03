import json
from rest_framework import viewsets, views, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.db.models import Avg, Count, Q, F, ExpressionWrapper, Max
from django.db.models.functions import Cast
from django.db.models import FloatField, IntegerField
from django.core.cache import cache
from .models import College, Program, StudentProfile, DateDim, FeedbackCategory, FeedbackFact
from .serializers import (
    CollegeListSerializer, 
    ProgramSerializer, 
    ReviewSubmitSerializer, 
    StudentRegistrationSerializer
)
from analytics.models import CollegeInsightCache, GlobalInsightCache
from analytics.serializers import CollegeInsightSerializer
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
        # Prefetch programs to avoid N+1 queries in serializer
        queryset = College.objects.prefetch_related('programs')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(location__icontains=search) | 
                Q(college_type__icontains=search) |
                Q(programs__program_name__icontains=search)
            ).distinct()

        # Annotate overall stats
        queryset = queryset.annotate(
            unique_reviews=Count('feedback__submission_id', distinct=True)
        ).annotate(
            avg_score=Avg('feedback__score')
        ).annotate(
            recommend_pct=ExpressionWrapper(
                Avg(Cast('feedback__would_recommend', IntegerField())) * 100,
                output_field=FloatField(),
            )
        )

        return queryset

class CollegeSummaryView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        cache_key = f"college_summary_{id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        try:
            college = College.objects.prefetch_related('programs').get(id=id)
        except College.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        summary_data = self._get_summary(college)
        cache.set(cache_key, summary_data, timeout=300)
        return Response(summary_data)

    def _get_summary(self, college):
        # Optimized single query fetching minimal lightweight dictionary records
        facts_qs = FeedbackFact.objects.filter(college=college).values(
            'submission_id', 'category__category_name', 'score',
            'would_recommend', 'sentiment', 'positive_feedback', 'complaints', 'suggestions'
        )
        facts_list = list(facts_qs)
        programs_list = [p.program_name for p in college.programs.all()]

        if not facts_list:
            return self._empty_summary(college, programs_list)

        total_score_sum = 0
        total_score_count = 0
        cat_sums = {}
        cat_counts = {}
        submissions = {}

        for row in facts_list:
            sid = str(row['submission_id'])
            score = row['score']
            cname = row['category__category_name'] or "General"

            total_score_sum += score
            total_score_count += 1

            cat_sums[cname] = cat_sums.get(cname, 0) + score
            cat_counts[cname] = cat_counts.get(cname, 0) + 1

            if sid not in submissions:
                submissions[sid] = {
                    'would_recommend': row['would_recommend'],
                    'sentiment': (row['sentiment'] or '').upper(),
                    'pos': row['positive_feedback'],
                    'comp': row['complaints'],
                    'sug': row['suggestions'],
                }

        total_reviews = len(submissions)
        overall_avg = round(total_score_sum / total_score_count, 1) if total_score_count > 0 else 0
        cat_dict = {
            cname: round(cat_sums[cname] / cat_counts[cname], 1)
            for cname in cat_sums
        }

        recommends = sum(1 for s in submissions.values() if s['would_recommend'])
        recommend_pct = int((recommends / total_reviews) * 100) if total_reviews > 0 else 0

        positive = sum(1 for s in submissions.values() if s['sentiment'] == 'POSITIVE')
        neutral = sum(1 for s in submissions.values() if s['sentiment'] == 'NEUTRAL')
        negative = sum(1 for s in submissions.values() if s['sentiment'] == 'NEGATIVE')

        pos_feedbacks = [s['pos'] for s in submissions.values() if s['pos']]
        complaints = [s['comp'] for s in submissions.values() if s['comp']]
        suggestions = [s['sug'] for s in submissions.values() if s['sug']]

        labs_val = cat_dict.get('Infra — Quality of Equipment') or cat_dict.get('Labs', 0)
        wifi_val = cat_dict.get('Wi-Fi & Connectivity') or cat_dict.get('Wi-Fi', 0)
        hostel_val = cat_dict.get('Hostel & Accommodation') or cat_dict.get('Hostel', 0)
        infra_avg = round((labs_val + wifi_val + hostel_val) / 3, 2)

        return {
            "id": college.id,
            "name": college.name,
            "location": college.location,
            "type": college.get_college_type_display(),
            "programs": programs_list,
            "overallRating": overall_avg,
            "totalReviews": total_reviews,
            "recommendationPercent": recommend_pct,
            "ratings": {
                "teachingQuality": cat_dict.get('Teaching Quality', 0),
                "infrastructure": {
                    "labs": labs_val,
                    "wifi": wifi_val,
                    "hostel": hostel_val,
                    "overall": infra_avg
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

    def _empty_summary(self, college, programs_list=None):
        if programs_list is None:
            programs_list = [p.program_name for p in college.programs.all()]
        return {
            "id": college.id,
            "name": college.name,
            "location": college.location,
            "type": college.get_college_type_display(),
            "programs": programs_list,
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

        colleges = College.objects.filter(id__in=ids).prefetch_related('programs')
        summary_view = CollegeSummaryView()
        results = [summary_view._get_summary(c) for c in colleges]
        return Response(results)

class CollegeReviewsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        cache_key = f"college_reviews_{id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        try:
            college = College.objects.get(id=id)
        except College.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        # Single bulk query with select_related: ELIMINATES N+1 QUERIES!
        facts = (
            FeedbackFact.objects.filter(college=college)
            .select_related('student_profile', 'program', 'category')
            .order_by('-id')
        )

        reviews_map = {}
        for f in facts:
            sid = str(f.submission_id)
            if sid not in reviews_map:
                student_year = ""
                if f.student_profile:
                    student_year = f.student_profile.get_year_of_study_display()
                program_name = f.program.program_name if f.program else ""
                comment = f.positive_feedback or f.complaints or f.suggestions or ""
                reviews_map[sid] = {
                    "id": sid,
                    "collegeId": college.id,
                    "studentYear": student_year,
                    "program": program_name,
                    "ratings": {},
                    "sentiment": (f.sentiment or "NEUTRAL").lower(),
                    "comment": comment
                }

            cat_name = f.category.category_name if f.category else ""
            if cat_name:
                if cat_name == 'Teaching Quality':
                    reviews_map[sid]['ratings']['teachingQuality'] = f.score
                elif cat_name in ('Infra — Quality of Equipment', 'Labs'):
                    reviews_map[sid]['ratings']['labs'] = f.score
                elif cat_name in ('Wi-Fi & Connectivity', 'Wi-Fi'):
                    reviews_map[sid]['ratings']['wifi'] = f.score
                elif cat_name in ('Hostel & Accommodation', 'Hostel'):
                    reviews_map[sid]['ratings']['hostel'] = f.score
                elif cat_name in ('Placements & Opportunities', 'Career Placements'):
                    reviews_map[sid]['ratings']['careerPlacements'] = f.score
                reviews_map[sid]['ratings'][cat_name] = f.score

        results = list(reviews_map.values())
        cache.set(cache_key, results, timeout=300)
        return Response(results)

class CollegeDashboardBundleView(views.APIView):
    """
    GET /api/colleges/<id>/dashboard-bundle/
    High-performance endpoint that returns college summary, reviews, and ML insights
    in a SINGLE HTTP round-trip with server-side caching.
    """
    permission_classes = [AllowAny]

    def get(self, request, id):
        cache_key = f"college_bundle_{id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        try:
            college = College.objects.prefetch_related('programs').get(id=id)
        except College.DoesNotExist:
            return Response({'error': 'College not found'}, status=404)

        summary_view = CollegeSummaryView()
        summary = summary_view._get_summary(college)

        reviews_view = CollegeReviewsView()
        reviews_resp = reviews_view.get(request, id)
        reviews = reviews_resp.data if isinstance(reviews_resp, Response) else []

        insights = None
        try:
            insight_cache = CollegeInsightCache.objects.get(college_id=id)
            serializer = CollegeInsightSerializer(insight_cache)
            insights = serializer.data
        except CollegeInsightCache.DoesNotExist:
            insights = None

        bundle_data = {
            "college": summary,
            "reviews": reviews,
            "insights": insights,
        }
        cache.set(cache_key, bundle_data, timeout=300)
        return Response(bundle_data)

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

            # Invalidate backend cache for this college so new reviews show immediately
            cache.delete(f"college_summary_{college.id}")
            cache.delete(f"college_reviews_{college.id}")
            cache.delete(f"college_bundle_{college.id}")

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


class AdminSystemSummaryView(views.APIView):
    """
    GET /api/admin/system-summary/
    Returns macro-level system analytics:
    - Real database counts (Users, Colleges, Reviews, Facts)
    - Global sentiment breakdown (counts + percentages)
    - Latest 10 feedback submissions with full category rating breakdown
    - Recent user sign-ups
    - ML pipeline cache status and last execution timestamp
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # 1. Total counts
            total_colleges = College.objects.count()
            total_reviews = FeedbackFact.objects.values('submission_id').distinct().count()
            total_students = StudentProfile.objects.values('user_id').distinct().count()
            total_facts = FeedbackFact.objects.count()

            # 2. Registered auth users from auth.users (Supabase) or Django User
            auth_users_count = 0
            signups = []
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT count(*) FROM auth.users;")
                    row = cursor.fetchone()
                    auth_users_count = row[0] if row else 0

                    cursor.execute("""
                        SELECT id, email, created_at, raw_user_meta_data 
                        FROM auth.users 
                        ORDER BY created_at DESC 
                        LIMIT 10;
                    """)
                    for r in cursor.fetchall():
                        meta = r[3] if isinstance(r[3], dict) else json.loads(r[3] or '{}')
                        signups.append({
                            'id': str(r[0]),
                            'email': r[1] or '',
                            'created_at': r[2].isoformat() if r[2] else None,
                            'role': meta.get('role', 'Student'),
                            'name': meta.get('full_name') or (r[1].split('@')[0] if r[1] else 'User'),
                        })
            except Exception as auth_err:
                print("Notice: auth.users query skipped or not available:", auth_err)
                auth_users_count = 0

            # If fewer than 5 signups, augment with recent StudentProfiles for richer activity
            if len(signups) < 5:
                recent_profiles = (
                    StudentProfile.objects.select_related('program', 'program__college')
                    .order_by('-id')[:5]
                )
                for sp in recent_profiles:
                    sp_id_str = f"sp-{sp.id}"
                    if not any(s.get('id') == sp_id_str for s in signups):
                        college_name = sp.program.college.name if sp.program and sp.program.college else "College"
                        prog_name = sp.program.program_name if sp.program else "Enrolled"
                        display_name = f"{sp.user_id}" if sp.user_id else f"Student #{sp.id}"
                        signups.append({
                            'id': sp_id_str,
                            'email': f"{sp.user_id or 'student'}@unimetric.internal",
                            'created_at': sp.admission_date.isoformat() if sp.admission_date else None,
                            'role': 'Student',
                            'name': f"{display_name} ({prog_name})",
                        })

            total_users = max(total_students, auth_users_count)

            # 3. Sentiment breakdown across all unique submissions
            sentiments = {'positive': 0, 'neutral': 0, 'negative': 0}
            for item in FeedbackFact.objects.values('submission_id', 'sentiment').distinct():
                s = (item['sentiment'] or 'NEUTRAL').lower()
                if s in sentiments:
                    sentiments[s] += 1
                else:
                    sentiments['neutral'] += 1

            total_senti = sum(sentiments.values()) or 1
            percentages = {
                k: round((v / total_senti) * 100, 1) for k, v in sentiments.items()
            }

            # 4. Latest 10 feedback submissions
            latest_sids = list(
                FeedbackFact.objects.values('submission_id')
                .annotate(max_id=Max('id'))
                .order_by('-max_id')[:10]
            )
            sid_list = [item['submission_id'] for item in latest_sids]

            facts = (
                FeedbackFact.objects.filter(submission_id__in=sid_list)
                .select_related('college', 'program', 'student_profile', 'category')
                .order_by('-id')
            )

            # User map for quick display name resolution
            user_id_map = {s['id']: s for s in signups}

            submissions_dict = {}
            for f in facts:
                sid = str(f.submission_id)
                if sid not in submissions_dict:
                    uid = f.user_id or ''
                    matched_user = user_id_map.get(uid)
                    if matched_user:
                        user_display = f"{matched_user['name']} ({matched_user['email']})"
                    elif f.student_profile:
                        user_display = f"Student Year {f.student_profile.year_of_study} ({uid or 'Verified'})"
                    else:
                        user_display = uid or 'Anonymous Student'

                    submissions_dict[sid] = {
                        'submission_id': sid,
                        'college_id': f.college_id,
                        'college_name': f.college.name if f.college else 'Unknown College',
                        'college_location': f.college.location if f.college else '',
                        'college_type': f.college.get_college_type_display() if f.college else '',
                        'program_id': f.program_id,
                        'program_name': f.program.program_name if f.program else 'General Feedback',
                        'user_id': uid,
                        'user_display': user_display,
                        'student_year': f.student_profile.get_year_of_study_display() if f.student_profile else '',
                        'sentiment': (f.sentiment or 'neutral').lower(),
                        'would_recommend': f.would_recommend,
                        'positive_feedback': f.positive_feedback or '',
                        'complaints': f.complaints or '',
                        'suggestions': f.suggestions or '',
                        'created_at': f.created_at.isoformat() if f.created_at else None,
                        'ratings': {},
                    }
                if f.category:
                    submissions_dict[sid]['ratings'][f.category.category_name] = f.score

            submissions = []
            for sid in [str(s) for s in sid_list]:
                if sid in submissions_dict:
                    sub = submissions_dict[sid]
                    scores = list(sub['ratings'].values())
                    sub['average_score'] = round(sum(scores) / len(scores), 1) if scores else 0
                    submissions.append(sub)

            # 5. ML Pipeline Status
            global_cache = GlobalInsightCache.objects.first()
            pipeline_status = {
                'last_run': global_cache.computed_at.isoformat() if global_cache else None,
                'has_cached_insights': global_cache is not None,
                'total_cached_colleges': CollegeInsightCache.objects.count(),
            }

            return Response({
                'counts': {
                    'total_users': total_users,
                    'total_students': total_students,
                    'total_auth_users': auth_users_count,
                    'total_colleges': total_colleges,
                    'total_reviews': total_reviews,
                    'total_feedback_facts': total_facts,
                },
                'sentiment_breakdown': {
                    'counts': sentiments,
                    'percentages': percentages,
                    'total': total_senti,
                },
                'latest_submissions': submissions,
                'recent_signups': signups,
                'pipeline_status': pipeline_status,
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)


