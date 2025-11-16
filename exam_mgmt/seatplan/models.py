from django.db import models

from exam_schedule.models import Exam

class Hall(models.Model):
    name = models.CharField(max_length=100)
    rows = models.IntegerField()
    cols = models.IntegerField()    

    def __str__(self):
        return f"{self.name} ({self.rows}x{self.cols})"
    
class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.roll_no
    

class SeatPlan(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    row = models.IntegerField()
    column = models.IntegerField()

    def __str__(self):
        return f"{self.student.roll_no} - {self.hall.name} ({self.row},{self.column})"
