from django.urls import path
from . import views

urlpatterns = [
    path("", views.question_bank_home, name="question_bank_home"),
]