from django.contrib import admin
from .models import AdmittedStudent


@admin.register(AdmittedStudent)
class AdmittedStudentAdmin(admin.ModelAdmin):
    list_display = ('roll_no', 'name', 'exam', 'admitted_at')
    search_fields = ('roll_no', 'name', 'exam')
