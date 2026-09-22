import random
import uuid
from datetime import date
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import College, Program, StudentProfile, DateDim, FeedbackCategory, FeedbackFact
from api.views import calculate_year_of_study


class Command(BaseCommand):
    help = 'Seeds database with Persona-Based authentic mock data for colleges, programs, and reviews'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting Persona-Based Data Seeding...")

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

        # 4. Create 3 Distinct Institutions with Authentic Profiles
        college_specs = [
            {
                "id": 1,
                "name": "Premier Tech Institute",
                "location": "Bengaluru, Karnataka",
                "college_type": "AUTONOMOUS",
                "is_curriculum_modern": True,
                "living_baseline": 2.7,  # Mediocre infra/hostel baseline
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

        # 6. Persona Logic Engine & Data Generation
        # 30 reviews per college = 10 Persona A, 10 Persona B, 10 Persona C (90 reviews total)
        personas_list = ["TECH_ENTHUSIAST", "HOSTELER", "DAY_SCHOLAR"]
        facts_to_create = []

        total_review_count = 0

        for college, spec in college_objs:
            base_prof = spec["base_profile"]
            is_curriculum_modern = spec["is_curriculum_modern"]
            living_baseline = spec["living_baseline"]
            col_programs = programs_by_college[college.id]

            # Generate 10 reviews for each persona (30 reviews per college)
            for persona_type in personas_list:
                for rep in range(10):
                    total_review_count += 1
                    program = random.choice(col_programs)

                    # Demographics & Date logic
                    # Choose a Year of Study 1, 2, 3, or 4 with corresponding realistic admission date
                    year_num = random.choice([1, 2, 3, 4])
                    # In current year 2026:
                    # Year 1 -> admitted Aug 2026 (1 month ago)
                    # Year 2 -> admitted Aug 2025 (13 months ago)
                    # Year 3 -> admitted Aug 2024 (25 months ago)
                    # Year 4 -> admitted Aug 2023 (37 months ago)
                    adm_year = today.year - (year_num - 1)
                    admission_date_val = date(adm_year, 8, 1)
                    calculated_year = calculate_year_of_study(admission_date_val)

                    # Age group realistically correlated with year of study
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
                        user_id=f"student-{college.id}-{persona_type[:3]}-{rep}-{total_review_count}"
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
                        used_hostel = random.choice([True, False])

                        if is_curriculum_modern:
                            # Rates Wi-Fi, Labs, and Curriculum highly
                            ratings["Curriculum Relevance"] = 5
                            ratings["Infra — Quality of Equipment"] = random.choice([4, 5])
                            ratings["Wi-Fi & Connectivity"] = random.choice([4, 5])
                            ratings["Placements & Opportunities"] = random.choice([4, 5])
                            ratings["Teaching Quality"] = random.choice([4, 5])
                            ratings["Library & Resources"] = random.choice([4, 5])
                            ratings["Extracurriculars & Culture"] = random.choice([3, 4, 5])
                            ratings["Infra — Cleanliness"] = min(5, max(1, round(base_prof["Infra — Cleanliness"] + random.uniform(-0.5, 0.5))))
                            ratings["Infra — Basic Amenities"] = min(5, max(1, round(base_prof["Infra — Basic Amenities"] + random.uniform(-0.5, 0.5))))
                            ratings["Canteen & Food Quality"] = min(5, max(1, round(base_prof["Canteen & Food Quality"] + random.uniform(-0.5, 0.5))))
                            if used_hostel:
                                ratings["Hostel & Accommodation"] = min(5, max(1, round(base_prof["Hostel & Accommodation"] + random.uniform(-0.5, 0.5))))
                            would_recommend = True
                            positive_str = random.choice([
                                "Great environment for hackathons.",
                                "Good exposure to AI projects.",
                                "Active coding culture on campus and enthusiastic peer group."
                            ])
                            complaints_str = random.choice([
                                "Campus Wi-Fi drops occasionally during peak lab hours.",
                                "High project workload leaves little free time for sports.",
                                "Hostel and canteen infrastructure need minor improvements."
                            ])
                            suggestions_str = "Expand GPU workstation clusters for deep learning research."
                        else:
                            # Outdated curriculum: brutally downrate Placements and Recommend Score!
                            ratings["Curriculum Relevance"] = random.choice([1, 2])
                            ratings["Placements & Opportunities"] = random.choice([1, 2])  # Brutally downrated!
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
                            would_recommend = False  # Brutally downrated!
                            positive_str = random.choice([
                                "Good exposure to AI projects through student-run coding clubs.",
                                "Great environment for hackathons organized outside campus.",
                                "Campus library has decent reference books."
                            ])
                            complaints_str = random.choice([
                                "Outdated syllabus doesn't prepare anyone for modern tech placement drives.",
                                "Curriculum has no cloud or AI coursework; obsolete technology stack.",
                                "Strict attendance policy hinders attending national hackathons."
                            ])
                            suggestions_str = "Overhaul curriculum to include modern distributed systems, cloud computing, and DevOps."

                    # -------------------------------------------------------------
                    # PERSONA B: "The Hosteler"
                    # -------------------------------------------------------------
                    elif persona_type == "HOSTELER":
                        used_hostel = True

                        # Scores for Hostel, Canteen, Cleanliness are tightly correlated
                        # Draw student living index around college baseline
                        living_index = living_baseline + random.uniform(-0.35, 0.35)
                        living_index = min(4.9, max(1.1, living_index))

                        # Tightly coupled within ±0.4 variance of each other
                        ratings["Hostel & Accommodation"] = min(5, max(1, round(living_index + random.uniform(-0.35, 0.35))))
                        ratings["Canteen & Food Quality"] = min(5, max(1, round(living_index + random.uniform(-0.45, 0.35))))
                        ratings["Infra — Cleanliness"] = min(5, max(1, round(living_index + random.uniform(-0.35, 0.45))))

                        # Other scores follow college profile
                        ratings["Teaching Quality"] = min(5, max(1, round(base_prof["Teaching Quality"] + random.uniform(-0.6, 0.6))))
                        ratings["Curriculum Relevance"] = min(5, max(1, round(base_prof["Curriculum Relevance"] + random.uniform(-0.6, 0.6))))
                        ratings["Library & Resources"] = min(5, max(1, round(base_prof["Library & Resources"] + random.uniform(-0.6, 0.6))))
                        ratings["Infra — Quality of Equipment"] = min(5, max(1, round(base_prof["Infra — Quality of Equipment"] + random.uniform(-0.6, 0.6))))
                        ratings["Infra — Basic Amenities"] = min(5, max(1, round(base_prof["Infra — Basic Amenities"] + random.uniform(-0.6, 0.6))))
                        ratings["Wi-Fi & Connectivity"] = min(5, max(1, round(base_prof["Wi-Fi & Connectivity"] + random.uniform(-0.6, 0.6))))
                        ratings["Placements & Opportunities"] = min(5, max(1, round(base_prof["Placements & Opportunities"] + random.uniform(-0.6, 0.6))))
                        ratings["Extracurriculars & Culture"] = min(5, max(1, round(base_prof["Extracurriculars & Culture"] + random.uniform(-0.6, 0.6))))

                        would_recommend = (living_index >= 3.0 and base_prof["Teaching Quality"] >= 3.2)

                        # Correlated Text Generation for Hosteler
                        if ratings["Hostel & Accommodation"] < 3:
                            complaints_str = random.choice([
                                "Hostel rooms are cramped.",
                                "Terrible Wi-Fi in the hostel.",
                                "Washrooms are rarely cleaned."
                            ])
                        else:
                            complaints_str = random.choice([
                                "Hostel curfew hours are slightly restrictive.",
                                "Laundry service takes several days to return clothes."
                            ])

                        if ratings["Hostel & Accommodation"] >= 4:
                            positive_str = "Spacious hostel rooms with 24/7 power backup and friendly wardens."
                        else:
                            positive_str = "Proximity to the department and close-knit hostel friendships."

                        suggestions_str = random.choice([
                            "Install commercial water purifiers and hot water geysers in all hostel wings.",
                            "Form an active student mess committee to audit kitchen hygiene.",
                            "Upgrade hostel Wi-Fi routers on residential floors."
                        ])

                    # -------------------------------------------------------------
                    # PERSONA C: "The Day Scholar"
                    # -------------------------------------------------------------
                    else:  # DAY_SCHOLAR
                        used_hostel = False
                        # Does NOT rate Hostel & Accommodation

                        # Focuses heavily on Teaching Quality, Library, and Extracurriculars
                        ratings["Teaching Quality"] = min(5, max(1, round(base_prof["Teaching Quality"] + random.uniform(-0.5, 0.5))))
                        ratings["Library & Resources"] = min(5, max(1, round(base_prof["Library & Resources"] + random.uniform(-0.5, 0.5))))
                        ratings["Extracurriculars & Culture"] = min(5, max(1, round(base_prof["Extracurriculars & Culture"] + random.uniform(-0.5, 0.5))))

                        ratings["Curriculum Relevance"] = min(5, max(1, round(base_prof["Curriculum Relevance"] + random.uniform(-0.6, 0.6))))
                        ratings["Infra — Quality of Equipment"] = min(5, max(1, round(base_prof["Infra — Quality of Equipment"] + random.uniform(-0.6, 0.6))))
                        ratings["Infra — Cleanliness"] = min(5, max(1, round(base_prof["Infra — Cleanliness"] + random.uniform(-0.6, 0.6))))
                        ratings["Infra — Basic Amenities"] = min(5, max(1, round(base_prof["Infra — Basic Amenities"] + random.uniform(-0.6, 0.6))))
                        ratings["Wi-Fi & Connectivity"] = min(5, max(1, round(base_prof["Wi-Fi & Connectivity"] + random.uniform(-0.6, 0.6))))
                        ratings["Canteen & Food Quality"] = min(5, max(1, round(base_prof["Canteen & Food Quality"] + random.uniform(-0.6, 0.6))))
                        ratings["Placements & Opportunities"] = min(5, max(1, round(base_prof["Placements & Opportunities"] + random.uniform(-0.6, 0.6))))

                        would_recommend = (ratings["Teaching Quality"] >= 3 and ratings["Library & Resources"] >= 3)

                        positive_str = random.choice([
                            "Vast library collection with air-conditioned quiet study cubicles.",
                            "Professors are approachable and clarify doubts after lectures.",
                            "Vibrant annual cultural fest and active literary society."
                        ])
                        complaints_str = random.choice([
                            "Parking spaces for commuting students are overcrowded.",
                            "Library hours should be extended past 8 PM for day scholars.",
                            "Canteen gets overcrowded during peak lunch break."
                        ])
                        suggestions_str = random.choice([
                            "Provide dedicated locker facilities and resting lounges for day scholars.",
                            "Digitalize library book borrowing with RFID self-checkout counters.",
                            "Provide campus shuttle connectivity to the nearest metro station."
                        ])

                    # -------------------------------------------------------------
                    # Global Text Overrides according to specific prompt requirements
                    # -------------------------------------------------------------
                    # 1. If Hostel < 3, complaints must randomly select from the exact 3 strings:
                    if used_hostel and ratings.get("Hostel & Accommodation", 5) < 3:
                        complaints_str = random.choice([
                            "Hostel rooms are cramped.",
                            "Terrible Wi-Fi in the hostel.",
                            "Washrooms are rarely cleaned."
                        ])

                    # 2. If Placements > 4, positives must select from the exact 3 strings:
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
                                positive_feedback=positive_str if sentiment_val == "POSITIVE" else "",
                                complaints=complaints_str if sentiment_val == "NEGATIVE" else "",
                                suggestions=suggestions_str if sentiment_val == "NEUTRAL" else ""
                            )
                            facts_to_create.append(fact)

        # 7. Bulk insert all facts atomically for fast execution
        with transaction.atomic():
            FeedbackFact.objects.bulk_create(facts_to_create, batch_size=500)

        total_facts = len(facts_to_create)
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(college_objs)} colleges with 3 programs each and {total_review_count} persona-driven reviews ({total_facts} total facts) across 11 categories."
            )
        )
