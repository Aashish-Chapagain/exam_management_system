import json
from datetime import date, timedelta

from django.contrib.auth.decorators import login_required
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods

from .forms import ExamForm
from .models import Exam
from .teachers_and_subjects import subjects, teachers


def _serialize_exam(exam):
    return {
        'id': exam.id,
        'term': exam.term,
        'course': exam.course,
        'klass': exam.course,
        'semester': exam.semester,
        'subject': exam.subject,
        'paper_code': exam.paper_code or '',
        'paper': exam.paper_code or '',
        'date': exam.date.isoformat(),
        'start_time': exam.start_time.isoformat(timespec='minutes'),
        'start': exam.start_time.isoformat(timespec='minutes'),
        'duration': exam.duration,
        'hall': exam.hall or '',
        'candidates': exam.candidates,
        'invigilators': exam.invigilators or '',
        'notes': exam.notes or '',
    }


@login_required
@require_http_methods(["GET", "POST"])
def scheduler(request):
    if request.method == 'POST':
        form = ExamForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('exam_schedule')
    else:
        form = ExamForm()

    exams_qs = Exam.objects.all().order_by('date', 'start_time')
    exams_list = [_serialize_exam(e) for e in exams_qs]

    return render(
        request,
        'exam_schedule/scheduler.html',
        {
            'form': form,
            'exams': exams_qs,
            'exams_list': exams_list,
        },
    )


@login_required
@require_http_methods(["GET"])
def auto_fill(request):
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

            payload.append(
                {
                    'course': course,
                    'semester': sem,
                    'subject': subj,
                    'paper_code': '',
                    'date': (start_date + timedelta(days=day_offset)).isoformat(),
                    'start_time': start_time,
                    'duration': duration,
                    'hall': '',
                    'candidates': 0,
                    'invigilators': invigilators,
                    'notes': '',
                }
            )
            day_offset += 1

    return JsonResponse(payload, safe=False)


@login_required
@require_http_methods(["GET", "POST"])
def exams_api(request):
    if request.method == 'GET':
        exams_qs = Exam.objects.all().order_by('date', 'start_time')
        return JsonResponse([_serialize_exam(e) for e in exams_qs], safe=False)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')

    form = ExamForm(payload)
    if form.is_valid():
        exam = form.save()
        return JsonResponse({'message': 'Created', 'exam': _serialize_exam(exam)}, status=201)
    return JsonResponse({'errors': form.errors}, status=400)


@login_required
@require_http_methods(["PUT", "DELETE"])
def exam_detail_api(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id)

    if request.method == 'DELETE':
        exam.delete()
        return JsonResponse({'message': 'Deleted'})

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')

    form = ExamForm(payload, instance=exam)
    if form.is_valid():
        updated_exam = form.save()
        return JsonResponse({'message': 'Updated', 'exam': _serialize_exam(updated_exam)})
    return JsonResponse({'errors': form.errors}, status=400)
