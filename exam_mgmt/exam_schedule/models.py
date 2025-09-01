from django.db import models

# Create your models here.

class ExamChecklist(models.Model):
    term = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    notes_overview = models.TextField(blank=True)

    # store yes/no (checkboxes)
    academic_calendar_ok = models.BooleanField(default=False)
    syllabus_completed = models.BooleanField(default=False)
    no_clash = models.BooleanField(default=False)
    student_wellbeing = models.BooleanField(default=False)
    logistics_ready = models.BooleanField(default=False)
    faculty_available = models.BooleanField(default=False)
    regulations_followed = models.BooleanField(default=False)
    accessibility_ready = models.BooleanField(default=False)
    weather_checked = models.BooleanField(default=False)
    results_ready = models.BooleanField(default=False)

    # optional notes for each section
    academic_calendar_notes = models.TextField(blank=True)
    syllabus_notes = models.TextField(blank=True)
    clash_notes = models.TextField(blank=True)
    wellbeing_notes = models.TextField(blank=True)
    logistics_notes = models.TextField(blank=True)
    faculty_notes = models.TextField(blank=True)
    regulations_notes = models.TextField(blank=True)
    accessibility_notes = models.TextField(blank=True)
    weather_notes = models.TextField(blank=True)
    results_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
