from django.contrib import admin
from .models import Student

# Register your models here.

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'name', 'department', 'semester', 'fees_paid', 'enrollment_year']
    list_filter = ['fees_paid', 'department', 'semester', 'enrollment_year']
    search_fields = ['student_id', 'name', 'email', 'phone']
    ordering = ['student_id']
    list_per_page = 50
