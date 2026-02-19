"""
Script to reset database and populate with 200 students
Run this after making model changes
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_mgmt.settings')
django.setup()

from std_account.models import Student
from admit_stds.models import AdmittedStudent
import random

print("Starting database setup...")

# Clear existing data
print("Clearing existing data...")
AdmittedStudent.objects.all().delete()
Student.objects.all().delete()
print("Cleared existing students and admitted students")

# Sample data for generating realistic student information
first_names = [
    'Aarav', 'Advait', 'Aditya', 'Akshay', 'Amit', 'Ananya', 'Anjali', 'Arjun', 'Arun', 'Ayush',
    'Bhavya', 'Chetan', 'Deepak', 'Dhruv', 'Divya', 'Gaurav', 'Harish', 'Ishaan', 'Isha', 'Jay',
    'Karan', 'Kavya', 'Krishna', 'Kunal', 'Lakshmi', 'Manish', 'Maya', 'Meera', 'Neha', 'Nikhil',
    'Nisha', 'Om', 'Pooja', 'Pradeep', 'Priya', 'Rahul', 'Raj', 'Ravi', 'Riya', 'Rohan',
    'Sagar', 'Sahil', 'Sameer', 'Sandeep', 'Sanjay', 'Sara', 'Shreya', 'Simran', 'Sneha', 'Sunil',
    'Tanvi', 'Tara', 'Uday', 'Varun', 'Vedant', 'Vijay', 'Vikram', 'Vishal', 'Yash', 'Zara'
]

last_names = [
    'Agarwal', 'Bhat', 'Chauhan', 'Desai', 'Dutta', 'Gandhi', 'Gupta', 'Iyer', 'Jain', 'Kapoor',
    'Khan', 'Kumar', 'Malhotra', 'Mehta', 'Mishra', 'Nair', 'Patel', 'Rao', 'Reddy', 'Sharma',
    'Singh', 'Sinha', 'Trivedi', 'Verma', 'Yadav'
]

students_created = 0
departments = ['CS', 'IT', 'EC', 'ME', 'CE', 'EE']
current_year = 2026

print("Creating 200 students...")
for i in range(1, 201):
    # Generate student ID
    dept = random.choice(departments)
    year = random.randint(2022, 2025)
    student_id = f"{dept}{year % 100}{i:04d}"
    
    # Generate name
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    full_name = f"{first_name} {last_name}"
    
    # Generate email
    email = f"{first_name.lower()}.{last_name.lower()}{i}@college.edu"
    
    # Generate phone
    phone = f"+91{random.randint(7000000000, 9999999999)}"
    
    # Calculate semester based on enrollment year
    enrollment_year = year
    years_since_enrollment = current_year - enrollment_year
    semester = min(years_since_enrollment * 2 + random.randint(1, 2), 8)
    
    # Randomize fees status (approximately 70% paid, 30% unpaid)
    fees_paid = random.random() < 0.7
    
    try:
        student = Student.objects.create(
            student_id=student_id,
            name=full_name,
            email=email,
            phone=phone,
            department=dept,
            semester=semester,
            fees_paid=fees_paid,
            enrollment_year=enrollment_year
        )
        students_created += 1
        
        if students_created % 50 == 0:
            print(f'Created {students_created} students...')
            
    except Exception as e:
        print(f'Error creating student {student_id}: {str(e)}')

print(f'\nSuccessfully created {students_created} students!')

# Show statistics
total = Student.objects.count()
paid = Student.objects.filter(fees_paid=True).count()
unpaid = Student.objects.filter(fees_paid=False).count()

print(f'\n=== Statistics ===')
print(f'Total Students: {total}')
print(f'Fees Paid: {paid} ({paid/total*100:.1f}%)')
print(f'Fees Not Paid: {unpaid} ({unpaid/total*100:.1f}%)')
print('\nDatabase setup complete!')
