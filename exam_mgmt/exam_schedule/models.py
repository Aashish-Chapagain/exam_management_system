from django.db import models

class Exam(models.Model):
    term = models.CharField(max_length=50)
    course = models.CharField(max_length=100)
    semester = models.IntegerField()
    subject = models.CharField(max_length=100)
    paper_code = models.CharField(max_length=50, blank=True, null=True)
    date = models.DateField()
    start_time = models.TimeField()
    duration = models.IntegerField(default=90)
    hall = models.CharField(max_length=50, blank=True, null=True)
    candidates = models.IntegerField(default=0)
    invigilators = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.course} (Sem {self.semester}) - {self.subject}"
