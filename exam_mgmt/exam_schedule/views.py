from django.shortcuts import render, redirect
from .forms import ExamCheckListForm

# Create your views here.

def scheduler(request):
    if request.method == 'POST':
        form = ExamCheckListForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("scheduler")
    else : 
        form = ExamCheckListForm()
    
    return render(request, 'exam_schedule/scheduler.html', {"form": form})

