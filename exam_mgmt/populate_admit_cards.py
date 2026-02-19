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
from admit_stds.models import AdmittedStudent
from datetime import date

print("Creating admit cards for all eligible students...")

# Clear existing admit cards
existing = AdmittedStudent.objects.count()
AdmittedStudent.objects.all().delete()
print(f"Cleared {existing} existing admit cards")

# Get all students who have paid fees
eligible_students = Student.objects.filter(fees_paid=True).order_by('student_id')
total_eligible = eligible_students.count()
print(f"Found {total_eligible} students eligible for admit cards (fees paid)")

# Create admit cards
exam_name = 'Final Semester Examination 2026'
exam_date = date(2026, 3, 15)

created = 0
for student in eligible_students:
    AdmittedStudent.objects.create(
        student=student,
        exam=exam_name,
        exam_date=exam_date
    )
    created += 1
    if created % 25 == 0:
        print(f"Created {created} admit cards...")

print(f"\n✅ Successfully created {created} admit cards!")
print(f"Exam: {exam_name}")
print(f"Exam Date: {exam_date}")
print(f"\nAdmit cards generated for all students with paid fees!")
