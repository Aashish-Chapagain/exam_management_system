from django.shortcuts import render, redirect
from django.urls import reverse
from django import forms
from .models import Hall, Student, SeatPlan
from exam_schedule.models import Exam


class HallForm(forms.ModelForm):
    class Meta:
        model = Hall
        fields = ['name', 'rows', 'cols']


def home(request):
    return render(request, 'seatplan/home.html')


def select_exam_hall(request):
    if request.method == 'POST':
        exam_id = request.POST.get('exam_id')
        hall_id = request.POST.get('hall_id')
        if exam_id and hall_id:
            return redirect('generate_seatplan', exam_id=int(exam_id), hall_id=int(hall_id))
    exams = list(Exam.objects.all())
    halls = list(Hall.objects.all())

    # prepare JSON-serializable data for client-side behavior
    exams_json = [
        {
            'id': e.id,
            'subject': e.subject,
            'semester': e.semester,
            'hall_name': e.hall or ''
        }
        for e in exams
    ]

    halls_json = [
        {
            'id': h.id,
            'name': h.name,
            'rows': h.rows,
            'cols': h.cols
        }
        for h in halls
    ]

    selected_hall_id = request.GET.get('selected_hall_id')

    return render(request, 'seatplan/select_exam_hall.html', {
        'exams': exams,
        'halls': halls,
        'exams_json': exams_json,
        'halls_json': halls_json,
        'selected_hall_id': selected_hall_id,
    })


def create_hall(request):
    # simple create hall view; can be invoked with ?name=HallName
    initial_name = request.GET.get('name', '')
    if request.method == 'POST':
        form = HallForm(request.POST)
        if form.is_valid():
            hall = form.save()
            # redirect back to select page and pre-select the created hall
            return redirect(reverse('seatplan_select') + f'?selected_hall_id={hall.id}')
    else:
        form = HallForm(initial={'name': initial_name, 'rows': 10, 'cols': 10})

    return render(request, 'seatplan/create_hall.html', {'form': form})

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
