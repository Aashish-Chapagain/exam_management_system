from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import ExamForm
from .models import Exam
import json
from .teachers_and_subjects import teachers, subjects
from django.http import JsonResponse, HttpResponseBadRequest
from datetime import date, timedelta


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


@login_required
def auto_fill(request):
    """Return generated routine data from teachers_and_subjects.py as JSON.
    Produces entries for course 'BCA' for all semesters with sequential dates.
    Optional query params:
      - course: default 'BCA'
      - start_date: ISO date string to start from (default: tomorrow)
      - start_time: HH:MM (default: 09:00)
      - duration: minutes (default: 90)
    """
    course = request.GET.get('course', 'BCA')
    try:
        start_date = date.fromisoformat(request.GET.get('start_date'))
    except Exception:
        start_date = date.today() + timedelta(days=1)
    start_time = request.GET.get('start_time', '09:00')
    try:
        duration = int(request.GET.get('duration', '90'))
    except ValueError:
        duration = 90

    # Round-robin invigilators
    inv_list = list(teachers)
    inv_i = 0

    payload = []
    day_offset = 0
    for sem in sorted(subjects.keys()):
        for subj in subjects[sem]:
            if not subj:
                continue
            inv_a = inv_list[inv_i % len(inv_list)] if inv_list else ''
            inv_b = inv_list[(inv_i + 1) % len(inv_list)] if len(inv_list) > 1 else ''
            invigilators = ", ".join([x for x in [inv_a, inv_b] if x])
            inv_i += 1

            payload.append({
                'course': course,
                'semester': str(sem),
                'subject': subj,
                'paper_code': '',
                'date': (start_date + timedelta(days=day_offset)).isoformat(),
                'start_time': start_time,
                'duration': duration,
                'hall': '',
                'candidates': 0,
                'invigilators': invigilators,
                'notes': '',
            })
            # Ensure minimum 1-day gap between papers by default
            day_offset += 1

    return JsonResponse(payload, safe=False)


@login_required
def create_exam_api(request):
    """Create an exam from JSON payload.
    Expects fields compatible with ExamForm: course, semester, subject,
    paper_code, date (YYYY-MM-DD), start_time (HH:MM), duration (int),
    hall, candidates (int), invigilators, notes.
    """
    if request.method != 'POST':
        return HttpResponseBadRequest('Only POST allowed')

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')

    form = ExamForm(payload)
    if form.is_valid():
        exam = form.save()
        return JsonResponse({
            'id': str(exam.id),
            'message': 'Created',
        }, status=201)
    else:
        return JsonResponse({'errors': form.errors}, status=400)




