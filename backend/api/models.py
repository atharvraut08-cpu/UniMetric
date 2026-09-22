import uuid
from django.db import models

class College(models.Model):
    COLLEGE_TYPE_CHOICES = [
        ("PRIVATE", "Private"),
        ("GOVERNMENT", "Government"),
        ("AUTONOMOUS", "Autonomous"),
        ("DEEMED", "Deemed"),
    ]
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    college_type = models.CharField(max_length=20, choices=COLLEGE_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Program(models.Model):
    id = models.AutoField(primary_key=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name="programs")
    program_name = models.CharField(max_length=255)
    degree_type = models.CharField(max_length=100)
    subject_area = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.program_name} at {self.college.name}"

class StudentProfile(models.Model):
    YEAR_CHOICES = [
        ("1", "1st Year"), ("2", "2nd Year"), ("3", "3rd Year"), ("4", "4th Year"),
    ]
    id = models.AutoField(primary_key=True)
    user_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    age_group = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    state_of_domicile = models.CharField(max_length=100, blank=True)
    year_of_study = models.CharField(max_length=1, choices=YEAR_CHOICES)

class DateDim(models.Model):
    id = models.AutoField(primary_key=True)
    full_date = models.DateField(unique=True)
    year = models.IntegerField()
    quarter = models.IntegerField()
    month = models.IntegerField()
    academic_year = models.CharField(max_length=9)

class FeedbackCategory(models.Model):
    GROUP_CHOICES = [
        ("TEACHING", "Teaching & Learning"),
        ("INFRASTRUCTURE", "Infrastructure"),
        ("CAREER", "Career & Student Experience"),
    ]
    id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100)
    category_group = models.CharField(max_length=20, choices=GROUP_CHOICES)

    def __str__(self):
        return self.category_name

class FeedbackFact(models.Model):
    SENTIMENT_CHOICES = [
        ("POSITIVE", "Positive"),
        ("NEUTRAL", "Neutral"),
        ("NEGATIVE", "Negative"),
    ]
    id = models.AutoField(primary_key=True)

    # Dimension foreign keys
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name="feedback")
    program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, related_name="feedback")
    student_profile = models.ForeignKey(StudentProfile, on_delete=models.SET_NULL, null=True)
    date = models.ForeignKey(DateDim, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(FeedbackCategory, on_delete=models.CASCADE)

    # Measure
    score = models.PositiveSmallIntegerField()

    # Degenerate Dimension
    submission_id = models.UUIDField(default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)

    # Categorical / Text
    would_recommend = models.BooleanField()
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, blank=True)
    positive_feedback = models.TextField(blank=True)
    complaints = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
