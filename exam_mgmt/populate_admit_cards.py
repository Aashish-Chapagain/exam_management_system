"""
Script to create admit cards for all students who have paid fees
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_mgmt.settings')
django.setup()

from std_account.models import Student
from exam_schedule.models import Exam
from admit_stds.models import AdmittedStudent
from datetime import date
import random

print("Creating admit cards for all eligible students...")

# Clear existing admit cards
existing = AdmittedStudent.objects.count()
AdmittedStudent.objects.all().delete()
print(f"Cleared {existing} existing admit cards")

# Get all students who have paid fees
eligible_students = list(Student.objects.filter(fees_paid=True).order_by('student_id'))
total_eligible = len(eligible_students)
print(f"Found {total_eligible} students eligible for admit cards (fees paid)")

# Create admit cards
exam_name = 'Final Semester Examination 2026'
exam_date = date(2026, 3, 15)

created = 0
if total_eligible == 0:
    print("No eligible students found. Exiting.")
else:
    semesters = list(range(1, 9))
    min_per_sem = 30
    max_per_sem = 35
    capacity = max_per_sem * len(semesters)

    if total_eligible < min_per_sem * len(semesters):
        min_per_sem = max(1, total_eligible // len(semesters))

    counts = {sem: min_per_sem for sem in semesters}
    remaining = total_eligible - (min_per_sem * len(semesters))

    # Distribute remaining students across semesters, without exceeding max_per_sem
    if remaining > 0:
        random.shuffle(semesters)
        for i in range(remaining):
            sem = semesters[i % len(semesters)]
            if counts[sem] < max_per_sem:
                counts[sem] += 1

    # Cap any overflow students beyond max capacity
    if total_eligible > capacity:
        print(f"Only {capacity} students will be admitted to keep at most {max_per_sem} per semester.")
        eligible_students = eligible_students[:capacity]

    # Build semester assignments and shuffle for randomness
    assignments = []
    for sem in semesters:
        assignments.extend([sem] * counts[sem])
    random.shuffle(assignments)

    # Prefer linking admit cards to scheduled exams by semester
    exams_by_semester = {}
    for exam in Exam.objects.all().order_by('-date'):
        if exam.semester not in exams_by_semester:
            exams_by_semester[exam.semester] = exam

    # Assign each eligible student a semester
    random.shuffle(eligible_students)
    for student, sem in zip(eligible_students, assignments):
        exam = exams_by_semester.get(sem)
        AdmittedStudent.objects.create(
            student=student,
            exam=exam.subject if exam else exam_name,
            exam_date=exam.date if exam else exam_date,
            semester=sem
        )
        created += 1
        if created % 25 == 0:
            print(f"Created {created} admit cards...")

print(f"\n✅ Successfully created {created} admit cards!")
print(f"Exam: {exam_name}")
print(f"Exam Date: {exam_date}")
print(f"\nAdmit cards generated for all students with paid fees!")
