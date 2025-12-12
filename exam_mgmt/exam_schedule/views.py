from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import ExamForm
from .models import Exam
import json
from .teachers_and_subjects import teachers, subjects


@login_required
def scheduler(request):
    if request.method == 'POST':
        form = ExamForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('exam_schedule')
    else:
        form = ExamForm()

    exams_qs = Exam.objects.all().order_by('date', 'start_time')

    
    exams_list = []
    for e in exams_qs:
        exams_list.append({
            'id': str(e.id),
            'term': e.term,
            'klass': e.course,
            'semester': str(e.semester) if e.semester is not None else '',
            'subject': e.subject,
            'paper': e.paper_code or '',
            'date': e.date.isoformat(),
            'start': e.start_time.isoformat(timespec='minutes'),
            'duration': e.duration,
            'hall': e.hall or '',
            'candidates': e.candidates,
            'invigilators': e.invigilators or '',
            'notes': e.notes or '',
        })

    exams_json = json.dumps(exams_list)

    return render(request, 'exam_schedule/scheduler.html', {'form': form, 'exams': exams_qs, 'exams_json': exams_json})
