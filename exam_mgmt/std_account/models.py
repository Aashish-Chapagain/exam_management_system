from django.db import models



class Student(models.Model):
    SEMESTER_CHOICES = [
        (1, 'Semester 1'),
        (2, 'Semester 2'),
        (3, 'Semester 3'),
        (4, 'Semester 4'),
        (5, 'Semester 5'),
        (6, 'Semester 6'),
        (7, 'Semester 7'),
        (8, 'Semester 8'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('BCA', 'Bachelor in Computer Application'),
    ]
    
    student_id = models.CharField(max_length=20, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    department = models.CharField(max_length=3, choices=DEPARTMENT_CHOICES)
    semester = models.IntegerField(choices=SEMESTER_CHOICES)
    fees_paid = models.BooleanField(default=False)  # Flag for fees status
    enrollment_year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student_id']

    def __str__(self):
        return f"{self.student_id} - {self.name}"
