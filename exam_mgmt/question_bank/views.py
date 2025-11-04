from django.shortcuts import render, redirect
from .forms import QuestionPaperForm
from .models import QuestionPaper


def question_bank_home(request):
    if request.method == 'POST':
        form = QuestionPaperForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('question_bank_home')
    else:
        form = QuestionPaperForm()

    questions = QuestionPaper.objects.all().order_by('-uploaded_at')
    return render(request, 'question_bank/question_upload.html', {'form': form, 'questions': questions})