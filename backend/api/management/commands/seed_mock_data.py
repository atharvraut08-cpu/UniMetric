import json
import uuid
from pathlib import Path
from datetime import date
from django.core.management.base import BaseCommand
from api.models import College, Program, StudentProfile, DateDim, FeedbackCategory, FeedbackFact

class Command(BaseCommand):
    help = 'Seeds database with mock JSON data'

    def handle(self, *args, **kwargs):
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        colleges_path = base_dir / 'src' / 'mock' / 'colleges.json'
        reviews_path = base_dir / 'src' / 'mock' / 'reviews.json'

        if not colleges_path.exists() or not reviews_path.exists():
            self.stdout.write(self.style.ERROR(f'Mock data files not found in {base_dir}'))
            return

        with open(colleges_path, 'r', encoding='utf-8') as f:
            colleges_data = json.load(f)

        with open(reviews_path, 'r', encoding='utf-8') as f:
            reviews_data = json.load(f)

        # Clear existing data
        FeedbackFact.objects.all().delete()
        Program.objects.all().delete()
        College.objects.all().delete()
        DateDim.objects.all().delete()
        StudentProfile.objects.all().delete()
        FeedbackCategory.objects.all().delete()

        # Create Categories
        categories = {
            'teachingQuality': FeedbackCategory.objects.create(category_name='Teaching Quality', category_group='TEACHING'),
            'labs': FeedbackCategory.objects.create(category_name='Labs', category_group='INFRASTRUCTURE'),
            'wifi': FeedbackCategory.objects.create(category_name='Wi-Fi', category_group='INFRASTRUCTURE'),
            'hostel': FeedbackCategory.objects.create(category_name='Hostel', category_group='INFRASTRUCTURE'),
            'careerPlacements': FeedbackCategory.objects.create(category_name='Career Placements', category_group='CAREER')
        }

        # Create Date
        today = date.today()
        date_dim = DateDim.objects.create(
            full_date=today,
            year=today.year,
            quarter=(today.month - 1) // 3 + 1,
            month=today.month,
            academic_year=f"{today.year}-{today.year+1}"
        )

        college_map = {}
        program_map = {}

        # 1. Seed Colleges and Programs
        for idx, col_data in enumerate(colleges_data, 1):
            # Parse mock id col_001 to an int if needed, but we will just rely on sequence or force ID
            college = College.objects.create(
                id=idx, # Match id to index to make API calls easier (1 instead of "col_001")
                name=col_data['name'],
                location=col_data['location'],
                college_type=col_data['type'].upper()
            )
            college_map[col_data['id']] = college

            for prog_name in col_data['programs']:
                prog = Program.objects.create(
                    college=college,
                    program_name=prog_name,
                    degree_type="B.Tech" if "Engineering" in prog_name else "Degree",
                    subject_area="Engineering" if "Engineering" in prog_name else "Other"
                )
                program_map[f"{col_data['id']}_{prog_name}"] = prog

        # 2. Seed Reviews
        for rev_data in reviews_data:
            c_id = rev_data['collegeId']
            if c_id not in college_map: continue
            
            college = college_map[c_id]
            prog_key = f"{c_id}_{rev_data.get('program')}"
            program = program_map.get(prog_key)

            year_str = rev_data.get('studentYear', '1st Year')
            year_val = "1"
            if "2" in year_str: year_val = "2"
            elif "3" in year_str: year_val = "3"
            elif "4" in year_str: year_val = "4"

            profile = StudentProfile.objects.create(year_of_study=year_val)

            submission_id = uuid.uuid4()
            sentiment = rev_data.get('sentiment', 'NEUTRAL').upper()
            comment = rev_data.get('comment', '')

            ratings = rev_data.get('ratings', {})
            for key, score in ratings.items():
                if key in categories:
                    FeedbackFact.objects.create(
                        college=college,
                        program=program,
                        student_profile=profile,
                        date=date_dim,
                        category=categories[key],
                        score=score,
                        submission_id=submission_id,
                        would_recommend=sentiment == 'POSITIVE',
                        sentiment=sentiment,
                        positive_feedback=comment if sentiment == 'POSITIVE' else '',
                        complaints=comment if sentiment == 'NEGATIVE' else '',
                        suggestions=comment if sentiment == 'NEUTRAL' else ''
                    )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(college_map)} colleges and {len(reviews_data)} reviews'))
