from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import AdmittedStudent
from std_account.models import Student
from django import forms


class AdmittedStudentForm(forms.ModelForm):
    student = forms.ModelChoiceField(
        queryset=Student.objects.filter(fees_paid=True),
        label="Student (Only students who paid fees)"
    )
    
    class Meta:
        model = AdmittedStudent
        fields = ['student', 'exam', 'exam_date']


@login_required(login_url='admin_login')
def list_admitted(request):
    students = AdmittedStudent.objects.all().order_by('-admitted_at')
    return render(request, 'admit_stds/list.html', {'students': students})


@login_required(login_url='admin_login')
def create_admitted(request):
    if request.method == 'POST':
        form = AdmittedStudentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('admit_list')
    else:
        form = AdmittedStudentForm()
    return render(request, 'admit_stds/create.html', {'form': form})
