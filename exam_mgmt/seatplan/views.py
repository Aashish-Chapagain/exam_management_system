from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django import forms
from .models import Hall, SeatPlan
from exam_schedule.models import Exam
from admit_stds.models import AdmittedStudent
import random


class HallForm(forms.ModelForm):
    class Meta:
        model = Hall
        fields = ['name', 'rows', 'cols']


@login_required(login_url='admin_login')
def home(request):
    return render(request, 'seatplan/home.html')


@login_required(login_url='admin_login')
def select_exam_hall(request):
    if request.method == 'POST':
        exam_id = request.POST.get('exam_id')
        hall_ids = request.POST.getlist('hall_ids')  # Multiple halls
        if exam_id and hall_ids:
            return redirect('generate_seatplan', exam_id=int(exam_id), hall_ids=','.join(hall_ids))
    
    exams = list(Exam.objects.all())
    halls = list(Hall.objects.all())

    # prepare JSON-serializable data for client-side behavior
    exams_json = [
        {
            'id': e.id,
            'subject': e.subject,
            'semester': e.semester,
            'candidates': e.candidates,
            'hall_name': e.hall or ''
        }
        for e in exams
    ]

    halls_json = [
        {
            'id': h.id,
            'name': h.name,
            'rows': h.rows,
            'cols': h.cols,
            'capacity': h.capacity
        }
        for h in halls
    ]

    return render(request, 'seatplan/select_exam_hall.html', {
        'exams': exams,
        'halls': halls,
        'exams_json': exams_json,
        'halls_json': halls_json,
    })


@login_required(login_url='admin_login')
def create_hall(request):
    # simple create hall view; can be invoked with ?name=HallName
    initial_name = request.GET.get('name', '')
    if request.method == 'POST':
        form = HallForm(request.POST)
        if form.is_valid():
            hall = form.save()
            return redirect('seatplan_select')
    else:
        form = HallForm(initial={'name': initial_name, 'rows': 10, 'cols': 10})

    return render(request, 'seatplan/create_hall.html', {'form': form})

@login_required(login_url='admin_login')
def generate_seatplan(request, exam_id, hall_ids):
    exam = get_object_or_404(Exam, id=exam_id)
    hall_id_list = [int(h) for h in hall_ids.split(',')]
    halls = Hall.objects.filter(id__in=hall_id_list)
    
    # Get admitted students for this exam's semester
    admitted_students = list(
        AdmittedStudent.objects.filter(
            semester=exam.semester,
            exam=exam.subject
        ).order_by('?')  # Random order
    )
    
    if not admitted_students:
        # Fallback: get all students for this semester
        admitted_students = list(
            AdmittedStudent.objects.filter(semester=exam.semester).order_by('?')
        )
    
    # Calculate total capacity
    total_capacity = sum(h.capacity for h in halls)
    
    if len(admitted_students) > total_capacity:
        admitted_students = admitted_students[:total_capacity]
    
    # Clear existing seat plans for this exam
    SeatPlan.objects.filter(exam=exam, hall__in=halls).delete()
    
    # Distribute students across halls randomly
    student_index = 0
    seat_counter = 1
    
    for hall in halls:
        row = 1
        col = 1
        seats_in_hall = 0
        
        while seats_in_hall < hall.capacity and student_index < len(admitted_students):
            student = admitted_students[student_index]
            
            SeatPlan.objects.create(
                exam=exam,
                hall=hall,
                admitted_student=student,
                row=row,
                column=col,
                seat_number=seat_counter
            )
            
            col += 1
            if col > hall.cols:
                col = 1
                row += 1
            
            seats_in_hall += 1
            student_index += 1
            seat_counter += 1
    
    # Redirect to view all halls or first hall
    first_hall_id = hall_id_list[0]
    return redirect('view_seatplan', exam_id=exam.id, hall_id=first_hall_id)


@login_required(login_url='admin_login')
def view_seatplan(request, exam_id, hall_id):
    exam = get_object_or_404(Exam, id=exam_id)
    hall = get_object_or_404(Hall, id=hall_id)
    plans = SeatPlan.objects.filter(exam_id=exam_id, hall_id=hall_id).select_related('admitted_student', 'admitted_student__student')
    
    # Create a 2D grid representation
    grid = [[None for _ in range(hall.cols)] for _ in range(hall.rows)]
    
    for plan in plans:
        if plan.row <= hall.rows and plan.column <= hall.cols:
            grid[plan.row - 1][plan.column - 1] = {
                'roll_no': plan.admitted_student.get_roll_no(),
                'name': plan.admitted_student.get_name(),
                'seat_number': plan.seat_number
            }
    
    # Get all halls used for this exam
    all_halls = Hall.objects.filter(seatplan__exam=exam).distinct()
    
    return render(request, "seatplan/view_seatplan.html", {
        "plans": plans,
        "exam": exam,
        "hall": hall,
        "grid": grid,
        "all_halls": all_halls
    })
