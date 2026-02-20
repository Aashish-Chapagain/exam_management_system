from django.db import models
from std_account.models import Student


class AdmittedStudent(models.Model):
    # Keep old fields for backward compatibility during migration
    name = models.CharField(max_length=200, blank=True, null=True)
    roll_no = models.CharField(max_length=50, blank=True, null=True)
    
    # New field linking to Student model
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='admit_cards', null=True, blank=True)
    exam = models.CharField(max_length=200)
    exam_date = models.DateField(null=True, blank=True)
    admitted_at = models.DateTimeField(auto_now_add=True)
    semester = models.IntegerField(null = False, blank = False)
    class Meta:
        ordering = ['-admitted_at']

    def __str__(self):
        if self.student:
            return f"{self.student.student_id} - {self.student.name} - {self.exam}"
        return f"{self.roll_no} - {self.name} - {self.exam}"
    
    def get_name(self):
        return self.student.name if self.student else self.name
    
    def get_roll_no(self):
        return self.student.student_id if self.student else self.roll_no
    
