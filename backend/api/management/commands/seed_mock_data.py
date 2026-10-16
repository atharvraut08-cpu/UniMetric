import random
import uuid
from datetime import date
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import College, Program, StudentProfile, DateDim, FeedbackCategory, FeedbackFact
from api.views import calculate_year_of_study


class Command(BaseCommand):
    help = 'Seeds database with Persona-Based authentic mock data for 10 distinct colleges, programs, and reviews'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting Expanded 10-College Persona-Based Data Seeding...")

        # 1. Clear existing data in foreign-key dependency order
        FeedbackFact.objects.all().delete()
        StudentProfile.objects.all().delete()
        Program.objects.all().delete()
        College.objects.all().delete()
        FeedbackCategory.objects.all().delete()
        DateDim.objects.all().delete()

        # 2. Seed 11 Granular Feedback Categories
        category_defs = [
            ("Teaching Quality", "TEACHING"),
            ("Curriculum Relevance", "TEACHING"),
            ("Library & Resources", "TEACHING"),
            ("Infra — Quality of Equipment", "INFRASTRUCTURE"),
            ("Infra — Cleanliness", "INFRASTRUCTURE"),
            ("Infra — Basic Amenities", "INFRASTRUCTURE"),
            ("Wi-Fi & Connectivity", "INFRASTRUCTURE"),
            ("Canteen & Food Quality", "INFRASTRUCTURE"),
            ("Hostel & Accommodation", "INFRASTRUCTURE"),
            ("Placements & Opportunities", "CAREER"),
            ("Extracurriculars & Culture", "CAREER"),
        ]

        categories = {}
        for name, grp in category_defs:
            cat_obj = FeedbackCategory.objects.create(category_name=name, category_group=grp)
            categories[name] = cat_obj

        # 3. Seed Date Dimension
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

        # 4. Create 10 Distinct Institutions with Diverse Characteristics
        college_specs = [
            {
                "id": 1,
                "name": "Premier Tech Institute",
                "location": "Bengaluru, Karnataka",
                "college_type": "AUTONOMOUS",
                "is_curriculum_modern": True,
                "living_baseline": 2.7,  # Mediocre infra/hostel baseline
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 4.6,
                    "Curriculum Relevance": 4.7,
                    "Library & Resources": 4.3,
                    "Infra — Quality of Equipment": 4.1,
                    "Infra — Cleanliness": 2.8,
                    "Infra — Basic Amenities": 2.9,
                    "Wi-Fi & Connectivity": 3.8,
                    "Canteen & Food Quality": 2.7,
                    "Hostel & Accommodation": 2.6,
                    "Placements & Opportunities": 4.8,
                    "Extracurriculars & Culture": 3.9,
                }
            },
            {
                "id": 2,
                "name": "Heritage University",
                "location": "Kolkata, West Bengal",
                "college_type": "GOVERNMENT",
                "is_curriculum_modern": False,  # Outdated Curriculum!
                "living_baseline": 4.3,  # Great campus & hostels
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 3.7,
                    "Curriculum Relevance": 2.2,  # Outdated Curriculum!
                    "Library & Resources": 4.8,  # Historic, massive library
                    "Infra — Quality of Equipment": 4.2,
                    "Infra — Cleanliness": 4.5,
                    "Infra — Basic Amenities": 4.4,
                    "Wi-Fi & Connectivity": 4.2,
                    "Canteen & Food Quality": 4.0,
                    "Hostel & Accommodation": 4.4,
                    "Placements & Opportunities": 3.1,
                    "Extracurriculars & Culture": 4.7,  # Vibrant campus clubs & fests
                }
            },
            {
                "id": 3,
                "name": "Metro State College",
                "location": "Mumbai, Maharashtra",
                "college_type": "GOVERNMENT",
                "is_curriculum_modern": False,
                "living_baseline": 1.7,  # Bad Hostel & Wi-Fi!
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 3.0,
                    "Curriculum Relevance": 2.9,
                    "Library & Resources": 3.1,
                    "Infra — Quality of Equipment": 3.0,
                    "Infra — Cleanliness": 2.9,
                    "Infra — Basic Amenities": 2.7,
                    "Wi-Fi & Connectivity": 1.8,  # Bad Wi-Fi!
                    "Canteen & Food Quality": 2.4,
                    "Hostel & Accommodation": 1.6,  # Bad Hostel!
                    "Placements & Opportunities": 2.8,
                    "Extracurriculars & Culture": 3.0,
                }
            },
            {
                "id": 4,
                "name": "Global Institute of Technology",
                "location": "Hyderabad, Telangana",
                "college_type": "PRIVATE",
                "is_curriculum_modern": True,
                "living_baseline": 4.0,
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 4.3,
                    "Curriculum Relevance": 4.6,
                    "Library & Resources": 4.2,
                    "Infra — Quality of Equipment": 4.5,
                    "Infra — Cleanliness": 4.3,
                    "Infra — Basic Amenities": 4.1,
                    "Wi-Fi & Connectivity": 4.4,
                    "Canteen & Food Quality": 3.9,
                    "Hostel & Accommodation": 3.8,
                    "Placements & Opportunities": 4.7,  # Excellent Placements
                    "Extracurriculars & Culture": 3.4,
                }
            },
            {
                "id": 5,
                "name": "City Engineering College",
                "location": "Pune, Maharashtra",
                "college_type": "PRIVATE",
                "is_curriculum_modern": True,
                "living_baseline": 3.0,
                "mostly_day_scholars": True,  # mostly Day Scholars (No Hostel usage)
                "base_profile": {
                    "Teaching Quality": 4.2,  # Good Teaching
                    "Curriculum Relevance": 3.8,
                    "Library & Resources": 4.0,
                    "Infra — Quality of Equipment": 3.4,
                    "Infra — Cleanliness": 3.6,
                    "Infra — Basic Amenities": 3.5,
                    "Wi-Fi & Connectivity": 3.2,
                    "Canteen & Food Quality": 3.5,
                    "Hostel & Accommodation": 2.5,
                    "Placements & Opportunities": 2.2,  # Poor Placements
                    "Extracurriculars & Culture": 3.6,
                }
            },
            {
                "id": 6,
                "name": "National Science Academy",
                "location": "New Delhi, Delhi",
                "college_type": "GOVERNMENT",
                "is_curriculum_modern": True,
                "living_baseline": 3.8,
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 4.5,
                    "Curriculum Relevance": 4.3,
                    "Library & Resources": 4.9,  # Top-tier Library
                    "Infra — Quality of Equipment": 4.8,  # Top-tier Equipment
                    "Infra — Cleanliness": 4.2,
                    "Infra — Basic Amenities": 4.0,
                    "Wi-Fi & Connectivity": 4.1,
                    "Canteen & Food Quality": 3.6,
                    "Hostel & Accommodation": 3.7,
                    "Placements & Opportunities": 4.2,
                    "Extracurriculars & Culture": 1.9,  # Strict/Poor Extracurriculars
                }
            },
            {
                "id": 7,
                "name": "Pioneer Deemed University",
                "location": "Chennai, Tamil Nadu",
                "college_type": "DEEMED",
                "is_curriculum_modern": True,
                "living_baseline": 4.2,
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 2.9,  # Average Teaching
                    "Curriculum Relevance": 3.1,
                    "Library & Resources": 3.5,
                    "Infra — Quality of Equipment": 3.6,
                    "Infra — Cleanliness": 4.1,
                    "Infra — Basic Amenities": 4.0,
                    "Wi-Fi & Connectivity": 4.8,  # Great Wi-Fi
                    "Canteen & Food Quality": 4.2,
                    "Hostel & Accommodation": 4.1,
                    "Placements & Opportunities": 3.4,
                    "Extracurriculars & Culture": 4.9,  # Great Extracurriculars
                }
            },
            {
                "id": 8,
                "name": "Summit College of Engineering",
                "location": "Coimbatore, Tamil Nadu",
                "college_type": "AUTONOMOUS",
                "is_curriculum_modern": True,
                "living_baseline": 4.7,  # Excellent Hostel & Canteen
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 3.8,
                    "Curriculum Relevance": 3.7,
                    "Library & Resources": 4.0,
                    "Infra — Quality of Equipment": 3.9,
                    "Infra — Cleanliness": 4.6,
                    "Infra — Basic Amenities": 4.5,
                    "Wi-Fi & Connectivity": 4.0,
                    "Canteen & Food Quality": 4.8,  # Excellent Canteen
                    "Hostel & Accommodation": 4.7,  # Excellent Hostel
                    "Placements & Opportunities": 3.0,  # Average Placements
                    "Extracurriculars & Culture": 3.8,
                }
            },
            {
                "id": 9,
                "name": "Horizon Tech",
                "location": "Noida, Uttar Pradesh",
                "college_type": "PRIVATE",
                "is_curriculum_modern": True,
                "living_baseline": 2.1,  # Poor Cleanliness & Amenities
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 4.1,
                    "Curriculum Relevance": 4.8,  # Modern Curriculum
                    "Library & Resources": 3.8,
                    "Infra — Quality of Equipment": 4.0,
                    "Infra — Cleanliness": 2.1,  # Poor Cleanliness
                    "Infra — Basic Amenities": 2.0,  # Poor Basic Amenities
                    "Wi-Fi & Connectivity": 3.6,
                    "Canteen & Food Quality": 2.5,
                    "Hostel & Accommodation": 2.2,
                    "Placements & Opportunities": 4.1,
                    "Extracurriculars & Culture": 3.5,
                }
            },
            {
                "id": 10,
                "name": "Apex Institute",
                "location": "Ahmedabad, Gujarat",
                "college_type": "AUTONOMOUS",
                "is_curriculum_modern": True,
                "living_baseline": 2.2,  # Terrible Canteen & Amenities
                "mostly_day_scholars": False,
                "base_profile": {
                    "Teaching Quality": 4.2,
                    "Curriculum Relevance": 4.3,
                    "Library & Resources": 4.0,
                    "Infra — Quality of Equipment": 4.1,
                    "Infra — Cleanliness": 3.2,
                    "Infra — Basic Amenities": 1.9,  # Terrible Amenities
                    "Wi-Fi & Connectivity": 3.5,
                    "Canteen & Food Quality": 1.8,  # Terrible Canteen
                    "Hostel & Accommodation": 2.8,
                    "Placements & Opportunities": 4.8,  # High Placements
                    "Extracurriculars & Culture": 3.3,
                }
            },
        ]

        # Targeted technical programs
        program_names = ["Information Technology", "Computer Engineering", "Data Science"]
        college_objs = []
        programs_by_college = {}

        for spec in college_specs:
            college = College.objects.create(
                id=spec["id"],
                name=spec["name"],
                location=spec["location"],
                college_type=spec["college_type"]
            )
            college_objs.append((college, spec))
            programs_by_college[college.id] = []

            for p_name in program_names:
                prog = Program.objects.create(
                    college=college,
                    program_name=p_name,
                    degree_type="B.Tech",
                    subject_area="Engineering"
                )
                programs_by_college[college.id].append(prog)

        # 5. Demographic Options
        GENDERS = ["Male", "Female", "Other", "Prefer not to say"]
        STATES = [
            "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat",
            "Uttar Pradesh", "West Bengal", "Telangana", "Kerala", "Rajasthan"
        ]

        # 6. Qualitative Text Pools (Authentic, Persona-Driven)
        TECH_POSITIVES_HIGH = [
            "Great environment for hackathons with high-speed lab workstations.",
            "Active coding culture on campus and enthusiastic peer group.",
            "Good exposure to AI projects and modern distributed systems.",
            "Supportive faculty who encourage participating in national competitions.",
            "Strong alumni network at leading technology product firms."
        ]
        TECH_POSITIVES_LOW = [
            "Student-run coding clubs provide good exposure despite the syllabus.",
            "Enthusiastic classmates who collaborate on weekend hackathons.",
            "Library offers sufficient digital subscriptions for self-study."
        ]
        TECH_COMPLAINTS_HIGH = [
            "Campus Wi-Fi drops occasionally during peak lab hours.",
            "High project workload leaves little free time for sports.",
            "Access to GPU servers requires multi-step departmental approval."
        ]
        TECH_COMPLAINTS_OUTDATED = [
            "Outdated syllabus doesn't prepare anyone for modern tech placement drives.",
            "Curriculum has no cloud or AI coursework; obsolete technology stack.",
            "Strict attendance policy hinders attending national hackathons."
        ]
        TECH_SUGGESTIONS = [
            "Overhaul curriculum to include modern distributed systems, cloud computing, and DevOps.",
            "Expand GPU workstation clusters for deep learning research.",
            "Provide 24/7 lab access during major hackathon and project cycles.",
            "Introduce cloud provider credits (AWS/GCP) for student capstones."
        ]

        HOSTELER_POSITIVES_HIGH = [
            "Spacious hostel rooms with 24/7 power backup and friendly wardens.",
            "Clean living quarters with regular housekeeping and quiet study halls.",
            "Mess food is wholesome with decent variety throughout the week.",
            "Excellent residential community with evening sports tournaments."
        ]
        HOSTELER_POSITIVES_LOW = [
            "Close proximity to departments avoids long city commute times.",
            "Strong peer bonds and collaborative group study in hostel wings.",
            "Decent security and gated access in the residential block."
        ]
        HOSTELER_COMPLAINTS_TRIGGER = [
            "Hostel rooms are cramped.",
            "Terrible Wi-Fi in the hostel.",
            "Washrooms are rarely cleaned."
        ]
        HOSTELER_COMPLAINTS_GENERAL = [
            "Hostel curfew hours are slightly restrictive on weekends.",
            "Laundry service takes several days to return clothes.",
            "Mess menu gets repetitive towards the end of the academic month."
        ]
        HOSTELER_SUGGESTIONS = [
            "Install commercial water purifiers and hot water geysers in all hostel wings.",
            "Form an active student mess committee to audit kitchen hygiene.",
            "Upgrade hostel Wi-Fi routers on residential floors with mesh access points.",
            "Provide modern laundry washing machines on each hostel block."
        ]

        DAY_POSITIVES = [
            "Vast library collection with air-conditioned quiet study cubicles.",
            "Professors are approachable and clarify doubts after lectures.",
            "Vibrant annual cultural fest and active literary society.",
            "Well-organized departmental seminars with visiting industry speakers.",
            "Easy connectivity to local city transit and suburban rail stations."
        ]
        DAY_COMPLAINTS = [
            "Parking spaces for commuting students are overcrowded during morning hours.",
            "Library hours should be extended past 8 PM for day scholars.",
            "Canteen gets overcrowded during peak lunch break window.",
            "Lack of dedicated day-scholar lockers and study recreation areas."
        ]
        DAY_SUGGESTIONS = [
            "Provide dedicated locker facilities and resting lounges for day scholars.",
            "Digitalize library book borrowing with RFID self-checkout counters.",
            "Provide campus shuttle connectivity to the nearest metro station.",
            "Stagger lunch timings across branches to reduce canteen crowding."
        ]

        # 7. Generate 200 to 250 reviews per college (2000-2500 reviews total, ~25k fact rows, ~15 MB)
        facts_to_create = []
        total_review_count = 0

        for college, spec in college_objs:
            base_prof = spec["base_profile"]
            is_curriculum_modern = spec["is_curriculum_modern"]
            living_baseline = spec["living_baseline"]
            mostly_day = spec.get("mostly_day_scholars", False)
            col_programs = programs_by_college[college.id]

            # Generate between 200 and 250 reviews per college (2000-2500 reviews total)
            num_reviews_for_college = random.randint(200, 250)

            for rep in range(num_reviews_for_college):
                total_review_count += 1
                program = random.choice(col_programs)

                # Select persona according to college profile
                if mostly_day:
                    persona_type = random.choices(
                        ["DAY_SCHOLAR", "TECH_ENTHUSIAST", "HOSTELER"],
                        weights=[0.82, 0.12, 0.06]
                    )[0]
                else:
                    persona_type = random.choice(["TECH_ENTHUSIAST", "HOSTELER", "DAY_SCHOLAR"])

                # Year of Study 1, 2, 3, or 4 with corresponding realistic admission date
                year_num = random.choice([1, 2, 3, 4])
                adm_year = today.year - (year_num - 1)
                admission_date_val = date(adm_year, 8, 1)
                calculated_year = calculate_year_of_study(admission_date_val)

                if year_num == 1:
                    age_group_val = random.choice(["Under 18", "18-21"])
                elif year_num in (2, 3):
                    age_group_val = "18-21"
                else:
                    age_group_val = random.choice(["18-21", "22-25"])

                gender_val = random.choice(GENDERS)
                state_val = random.choice(STATES)

                profile = StudentProfile.objects.create(
                    year_of_study=calculated_year,
                    program=program,
                    admission_date=admission_date_val,
                    gender=gender_val,
                    age_group=age_group_val,
                    state_of_domicile=state_val,
                    user_id=f"student-{college.id}-{persona_type[:3].lower()}-{rep}-{total_review_count}"
                )

                submission_id = uuid.uuid4()
                ratings = {}
                used_hostel = False
                would_recommend = True
                positive_str = ""
                complaints_str = ""
                suggestions_str = ""

                # -------------------------------------------------------------
                # PERSONA A: "The Tech/Hackathon Enthusiast"
                # -------------------------------------------------------------
                if persona_type == "TECH_ENTHUSIAST":
                    used_hostel = False if mostly_day else random.choice([True, False])

                    if is_curriculum_modern:
                        ratings["Curriculum Relevance"] = min(5, max(1, round(base_prof["Curriculum Relevance"] + random.uniform(-0.3, 0.3))))
                        ratings["Infra — Quality of Equipment"] = min(5, max(1, round(base_prof["Infra — Quality of Equipment"] + random.uniform(-0.4, 0.4))))
                        ratings["Wi-Fi & Connectivity"] = min(5, max(1, round(base_prof["Wi-Fi & Connectivity"] + random.uniform(-0.4, 0.4))))
                        ratings["Placements & Opportunities"] = min(5, max(1, round(base_prof["Placements & Opportunities"] + random.uniform(-0.3, 0.3))))
                        ratings["Teaching Quality"] = min(5, max(1, round(base_prof["Teaching Quality"] + random.uniform(-0.4, 0.4))))
                        ratings["Library & Resources"] = min(5, max(1, round(base_prof["Library & Resources"] + random.uniform(-0.4, 0.4))))
                        ratings["Extracurriculars & Culture"] = min(5, max(1, round(base_prof["Extracurriculars & Culture"] + random.uniform(-0.5, 0.5))))
                        ratings["Infra — Cleanliness"] = min(5, max(1, round(base_prof["Infra — Cleanliness"] + random.uniform(-0.5, 0.5))))
                        ratings["Infra — Basic Amenities"] = min(5, max(1, round(base_prof["Infra — Basic Amenities"] + random.uniform(-0.5, 0.5))))
                        ratings["Canteen & Food Quality"] = min(5, max(1, round(base_prof["Canteen & Food Quality"] + random.uniform(-0.5, 0.5))))
                        if used_hostel:
                            ratings["Hostel & Accommodation"] = min(5, max(1, round(base_prof["Hostel & Accommodation"] + random.uniform(-0.5, 0.5))))

                        would_recommend = (ratings["Placements & Opportunities"] >= 3 and ratings["Curriculum Relevance"] >= 3)
                        positive_str = random.choice(TECH_POSITIVES_HIGH)
                        complaints_str = random.choice(TECH_COMPLAINTS_HIGH)
                        suggestions_str = random.choice(TECH_SUGGESTIONS)
                    else:
                        # Outdated curriculum: brutally downrate Placements and Recommend Score!
                        ratings["Curriculum Relevance"] = random.choice([1, 2])
                        ratings["Placements & Opportunities"] = random.choice([1, 2])
                        ratings["Wi-Fi & Connectivity"] = min(5, max(1, round(base_prof["Wi-Fi & Connectivity"] + random.uniform(-0.5, 0.5))))
                        ratings["Infra — Quality of Equipment"] = min(5, max(1, round(base_prof["Infra — Quality of Equipment"] + random.uniform(-0.5, 0.5))))
                        ratings["Teaching Quality"] = min(5, max(1, round(base_prof["Teaching Quality"] + random.uniform(-0.5, 0.5))))
                        ratings["Library & Resources"] = min(5, max(1, round(base_prof["Library & Resources"] + random.uniform(-0.5, 0.5))))
                        ratings["Infra — Cleanliness"] = min(5, max(1, round(base_prof["Infra — Cleanliness"] + random.uniform(-0.5, 0.5))))
                        ratings["Infra — Basic Amenities"] = min(5, max(1, round(base_prof["Infra — Basic Amenities"] + random.uniform(-0.5, 0.5))))
                        ratings["Canteen & Food Quality"] = min(5, max(1, round(base_prof["Canteen & Food Quality"] + random.uniform(-0.5, 0.5))))
                        ratings["Extracurriculars & Culture"] = min(5, max(1, round(base_prof["Extracurriculars & Culture"] + random.uniform(-0.5, 0.5))))
                        if used_hostel:
                            ratings["Hostel & Accommodation"] = min(5, max(1, round(base_prof["Hostel & Accommodation"] + random.uniform(-0.5, 0.5))))

                        would_recommend = False
                        positive_str = random.choice(TECH_POSITIVES_LOW)
                        complaints_str = random.choice(TECH_COMPLAINTS_OUTDATED)
                        suggestions_str = random.choice(TECH_SUGGESTIONS)

                # -------------------------------------------------------------
                # PERSONA B: "The Hosteler"
                # -------------------------------------------------------------
                elif persona_type == "HOSTELER":
                    used_hostel = True

                    # Scores for Hostel, Canteen, Cleanliness are tightly correlated
                    living_index = living_baseline + random.uniform(-0.35, 0.35)
                    living_index = min(4.9, max(1.1, living_index))

                    ratings["Hostel & Accommodation"] = min(5, max(1, round(living_index + random.uniform(-0.35, 0.35))))
                    ratings["Canteen & Food Quality"] = min(5, max(1, round(living_index + random.uniform(-0.45, 0.35))))
                    ratings["Infra — Cleanliness"] = min(5, max(1, round(living_index + random.uniform(-0.35, 0.45))))

                    ratings["Teaching Quality"] = min(5, max(1, round(base_prof["Teaching Quality"] + random.uniform(-0.5, 0.5))))
                    ratings["Curriculum Relevance"] = min(5, max(1, round(base_prof["Curriculum Relevance"] + random.uniform(-0.5, 0.5))))
                    ratings["Library & Resources"] = min(5, max(1, round(base_prof["Library & Resources"] + random.uniform(-0.5, 0.5))))
                    ratings["Infra — Quality of Equipment"] = min(5, max(1, round(base_prof["Infra — Quality of Equipment"] + random.uniform(-0.5, 0.5))))
                    ratings["Infra — Basic Amenities"] = min(5, max(1, round(base_prof["Infra — Basic Amenities"] + random.uniform(-0.5, 0.5))))
                    ratings["Wi-Fi & Connectivity"] = min(5, max(1, round(base_prof["Wi-Fi & Connectivity"] + random.uniform(-0.5, 0.5))))
                    ratings["Placements & Opportunities"] = min(5, max(1, round(base_prof["Placements & Opportunities"] + random.uniform(-0.5, 0.5))))
                    ratings["Extracurriculars & Culture"] = min(5, max(1, round(base_prof["Extracurriculars & Culture"] + random.uniform(-0.5, 0.5))))

                    would_recommend = (living_index >= 3.0 and base_prof["Teaching Quality"] >= 3.2)

                    if living_baseline >= 3.5:
                        positive_str = random.choice(HOSTELER_POSITIVES_HIGH)
                        complaints_str = random.choice(HOSTELER_COMPLAINTS_GENERAL)
                    else:
                        positive_str = random.choice(HOSTELER_POSITIVES_LOW)
                        complaints_str = random.choice(HOSTELER_COMPLAINTS_TRIGGER)
                    suggestions_str = random.choice(HOSTELER_SUGGESTIONS)

                # -------------------------------------------------------------
                # PERSONA C: "The Day Scholar"
                # -------------------------------------------------------------
                else:  # DAY_SCHOLAR
                    used_hostel = False
                    # Does NOT rate Hostel & Accommodation (handled natively by Star Schema!)

                    ratings["Teaching Quality"] = min(5, max(1, round(base_prof["Teaching Quality"] + random.uniform(-0.5, 0.5))))
                    ratings["Library & Resources"] = min(5, max(1, round(base_prof["Library & Resources"] + random.uniform(-0.5, 0.5))))
                    ratings["Extracurriculars & Culture"] = min(5, max(1, round(base_prof["Extracurriculars & Culture"] + random.uniform(-0.5, 0.5))))
                    ratings["Curriculum Relevance"] = min(5, max(1, round(base_prof["Curriculum Relevance"] + random.uniform(-0.5, 0.5))))
                    ratings["Infra — Quality of Equipment"] = min(5, max(1, round(base_prof["Infra — Quality of Equipment"] + random.uniform(-0.5, 0.5))))
                    ratings["Infra — Cleanliness"] = min(5, max(1, round(base_prof["Infra — Cleanliness"] + random.uniform(-0.5, 0.5))))
                    ratings["Infra — Basic Amenities"] = min(5, max(1, round(base_prof["Infra — Basic Amenities"] + random.uniform(-0.5, 0.5))))
                    ratings["Wi-Fi & Connectivity"] = min(5, max(1, round(base_prof["Wi-Fi & Connectivity"] + random.uniform(-0.5, 0.5))))
                    ratings["Canteen & Food Quality"] = min(5, max(1, round(base_prof["Canteen & Food Quality"] + random.uniform(-0.5, 0.5))))
                    ratings["Placements & Opportunities"] = min(5, max(1, round(base_prof["Placements & Opportunities"] + random.uniform(-0.5, 0.5))))

                    would_recommend = (ratings["Teaching Quality"] >= 3 and ratings["Library & Resources"] >= 3)
                    positive_str = random.choice(DAY_POSITIVES)
                    complaints_str = random.choice(DAY_COMPLAINTS)
                    suggestions_str = random.choice(DAY_SUGGESTIONS)

                # -------------------------------------------------------------
                # Global Text Overrides according to specific prompt rules
                # -------------------------------------------------------------
                # 1. If Hostel < 3, complaints must randomly select from the exact 3 trigger strings:
                if used_hostel and ratings.get("Hostel & Accommodation", 5) < 3:
                    complaints_str = random.choice([
                        "Hostel rooms are cramped.",
                        "Terrible Wi-Fi in the hostel.",
                        "Washrooms are rarely cleaned."
                    ])

                # 2. If Placements > 4, positives must randomly select from the exact 3 strings:
                if ratings.get("Placements & Opportunities", 0) > 4:
                    positive_str = random.choice([
                        "Amazing placement cell.",
                        "Great industry connections.",
                        "Got a solid internship here."
                    ])

                # Sentiment inference based on scores & recommendation
                avg_score = sum(ratings.values()) / len(ratings)
                if would_recommend and avg_score >= 3.6:
                    sentiment_val = "POSITIVE"
                elif not would_recommend and avg_score <= 2.8:
                    sentiment_val = "NEGATIVE"
                else:
                    sentiment_val = "NEUTRAL"

                # Create FeedbackFact rows for each rated category
                # ALL THREE TEXT FIELDS ARE STRICTLY NON-EMPTY AND POPULATED!
                for cat_name, score in ratings.items():
                    if cat_name in categories:
                        fact = FeedbackFact(
                            college=college,
                            program=program,
                            student_profile=profile,
                            date=date_dim,
                            category=categories[cat_name],
                            score=score,
                            submission_id=submission_id,
                            user_id=profile.user_id,
                            would_recommend=would_recommend,
                            sentiment=sentiment_val,
                            positive_feedback=positive_str,
                            complaints=complaints_str,
                            suggestions=suggestions_str
                        )
                        facts_to_create.append(fact)

        # 8. Bulk insert all facts atomically for fast execution
        with transaction.atomic():
            FeedbackFact.objects.bulk_create(facts_to_create, batch_size=1000)

        total_facts = len(facts_to_create)
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(college_objs)} colleges with 3 programs each and {total_review_count} persona-driven reviews ({total_facts} total facts) across 11 categories."
            )
        )
