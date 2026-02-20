#!/usr/bin/env python
"""
Script to clear all admitted students data
Run this from the exam_mgmt directory with: python clear_admitted_students.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_mgmt.settings')
django.setup()

from admit_stds.models import AdmittedStudent

def clear_admitted_students():
    count = AdmittedStudent.objects.count()
    if count == 0:
        print("No admitted students to delete.")
        return
    
    confirm = input(f"Are you sure you want to delete all {count} admitted student(s)? (yes/no): ")
    if confirm.lower() == 'yes':
        AdmittedStudent.objects.all().delete()
        print(f"Successfully deleted {count} admitted student(s).")
        print("\nYou can now re-add admitted students with correct semester information through the web interface.")
    else:
        print("Operation cancelled.")

if __name__ == '__main__':
    clear_admitted_students()
