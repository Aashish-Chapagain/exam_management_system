from django.contrib import admin
from .models import AdmittedStudent


@admin.register(AdmittedStudent)
class AdmittedStudentAdmin(admin.ModelAdmin):
    list_display = ('get_roll_no', 'get_name', 'exam', 'exam_date', 'admitted_at')
    search_fields = ('student__student_id', 'student__name', 'exam', 'name', 'roll_no')
    list_filter = ('exam_date', 'admitted_at', 'student__fees_paid', 'student__department')
    raw_id_fields = ('student',)
    
    def get_roll_no(self, obj):
        return obj.get_roll_no()
    get_roll_no.short_description = 'Roll No'
    
    def get_name(self, obj):
        return obj.get_name()
    get_name.short_description = 'Name'
