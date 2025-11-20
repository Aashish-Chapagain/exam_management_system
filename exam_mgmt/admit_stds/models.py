from django.db import models


class AdmittedStudent(models.Model):
    name = models.CharField(max_length=200)
    roll_no = models.CharField(max_length=50, unique=True)
    exam = models.CharField(max_length=200, blank=True, null=True)
    admitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.roll_no} - {self.name}"
