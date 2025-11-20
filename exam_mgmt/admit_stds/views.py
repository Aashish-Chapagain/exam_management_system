from django.shortcuts import render, redirect
from django.urls import reverse
from .models import AdmittedStudent
from django import forms


class AdmittedStudentForm(forms.ModelForm):
    class Meta:
        model = AdmittedStudent
        fields = ['name', 'roll_no', 'exam']


def list_admitted(request):
    students = AdmittedStudent.objects.all().order_by('-admitted_at')
    return render(request, 'admit_stds/list.html', {'students': students})


def create_admitted(request):
    if request.method == 'POST':
        form = AdmittedStudentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('admit_list')
    else:
        form = AdmittedStudentForm()
    return render(request, 'admit_stds/create.html', {'form': form})
