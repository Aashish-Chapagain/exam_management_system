from django.core.management.base import BaseCommand
from std_account.models import Student
import random


class Command(BaseCommand):
    help = 'Populate database with 200 students with randomized fees status'

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

    def handle(self, *args, **kwargs):
        # Clear existing students
        Student.objects.all().delete()
        self.stdout.write('Cleared existing students...')

        students_created = 0
        departments = ['CS', 'IT', 'EC', 'ME', 'CE', 'EE']
        current_year = 2026
        
        for i in range(1, 201):
            # Generate student ID
            dept = random.choice(departments)
            year = random.randint(2022, 2025)
            student_id = f"{dept}{year % 100}{i:04d}"
            
            # Generate name
            first_name = random.choice(self.first_names)
            last_name = random.choice(self.last_names)
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
                    self.stdout.write(f'Created {students_created} students...')
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating student {student_id}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {students_created} students!')
        )
        
        # Show statistics
        total = Student.objects.count()
        paid = Student.objects.filter(fees_paid=True).count()
        unpaid = Student.objects.filter(fees_paid=False).count()
        
        self.stdout.write(
            self.style.SUCCESS(f'\nStatistics:')
        )
        self.stdout.write(f'Total Students: {total}')
        self.stdout.write(f'Fees Paid: {paid} ({paid/total*100:.1f}%)')
        self.stdout.write(f'Fees Not Paid: {unpaid} ({unpaid/total*100:.1f}%)')
