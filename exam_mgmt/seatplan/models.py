from django.db import models

from exam_schedule.models import Exam
from admit_stds.models import AdmittedStudent

class Hall(models.Model):
    name = models.CharField(max_length=100)
    rows = models.IntegerField()
    cols = models.IntegerField()    

    def __str__(self):
        return f"{self.name} ({self.rows}x{self.cols})"
    
    @property
    def capacity(self):
        return self.rows * self.cols

class SeatPlan(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE)
    admitted_student = models.ForeignKey(AdmittedStudent, on_delete=models.CASCADE)
    row = models.IntegerField()
    column = models.IntegerField()
    seat_number = models.IntegerField()

    class Meta:
        unique_together = ['exam', 'hall', 'row', 'column']
        ordering = ['seat_number']

    def __str__(self):
        return f"{self.admitted_student.get_roll_no()} - {self.hall.name} Seat {self.seat_number}"
