from django.shortcuts import render, redirect
from .models import Hall, Student, SeatPlan
from exam_schedule.models import Exam


def home(request):
    return render(request, 'seatplan/home.html')


def select_exam_hall(request):
    if request.method == 'POST':
        exam_id = request.POST.get('exam_id')
        hall_id = request.POST.get('hall_id')
        if exam_id and hall_id:
            return redirect('generate_seatplan', exam_id=int(exam_id), hall_id=int(hall_id))
    exams = Exam.objects.all()
    halls = Hall.objects.all()
    return render(request, 'seatplan/select_exam_hall.html', {'exams': exams, 'halls': halls})

def generate_seatplan(request, exam_id, hall_id):
    exam = Exam.objects.get(id=exam_id)
    hall = Hall.objects.get(id=hall_id)
    students = Student.objects.all()[:exam.candidates]  
   
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
        if col > hall.cols:
            col = 1
            row += 1

    return redirect('view_seatplan', exam_id=exam.id, hall_id=hall.id)



def view_seatplan(request, exam_id, hall_id):
    plans = SeatPlan.objects.filter(exam_id=exam_id, hall_id=hall_id)
    exam = Exam.objects.get(id=exam_id)
    hall = Hall.objects.get(id=hall_id)
    return render(request, "seatplan/view_seatplan.html", {"plans": plans, "exam": exam, "hall": hall})
