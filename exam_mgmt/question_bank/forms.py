from django import forms
from .models import QuestionPaper


class QuestionPaperForm(forms.ModelForm):
    class Meta:
        model = QuestionPaper
        fields = ['semester', 'subject_name', 'question_file']
