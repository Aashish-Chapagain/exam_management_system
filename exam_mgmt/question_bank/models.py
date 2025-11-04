from django.db import models


class QuestionPaper(models.Model):
    semester = models.CharField(max_length=10)
    subject_name = models.CharField(max_length=200)
    question_file = models.FileField(upload_to='question_bank/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject_name} (Sem {self.semester})"
