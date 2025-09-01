from django import forms
from .models import ExamChecklist  # or whatever your model is

class ExamCheckListForm(forms.ModelForm):
    class Meta:
        model = ExamChecklist
        fields = ['term', 'start_date', 'end_date', 'academic_calendar_ok', 'academic_calendar_notes']
