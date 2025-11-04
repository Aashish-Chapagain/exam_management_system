from django.shortcuts import render, redirect
from .forms import ExamForm
from .models import Exam

def scheduler(request):
    if request.method == 'POST':
        form = ExamForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('scheduler')
    else:
        form = ExamForm()

    exams = Exam.objects.all().order_by('date', 'start_time')
    return render(request, 'exam_schedule/scheduler.html', {'form': form, 'exams': exams})
