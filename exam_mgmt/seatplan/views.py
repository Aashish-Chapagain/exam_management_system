from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from .models import Hall, Student, SeatPlan
from .models import Exam   

def generate_seatplan(request, exam_id, hall_id):
    exam = Exam.objects.get(id=exam_id)
    hall = Hall.objects.get(id=hall_id)
    students = Student.objects.all()[:exam.candidates]  # limit by exam.candidates

    # Clear old seat plan for this exam hall
    SeatPlan.objects.filter(exam=exam, hall=hall).delete()

    row = col = 1
    for student in students:
        SeatPlan.objects.create(
            exam=exam,
            hall=hall,
            student=student,
            row=row,
            column=col
        )
        col += 1
        if col > hall.columns:
            col = 1
            row += 1

    return redirect('view_seatplan', exam_id=exam.id, hall_id=hall.id)



def view_seatplan(request, exam_id, hall_id):
    plans = SeatPlan.objects.filter(exam_id=exam_id, hall_id=hall_id)
    return render(request, "view_seatplan.html", {"plans": plans})
