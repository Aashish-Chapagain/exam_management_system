from django.urls import path 
from . import views


urlpatterns = [
    path('', views.scheduler, name = 'exam_schedule'),
    path('auto-fill/', views.auto_fill, name='exam_auto_fill'),
    path('api/exams/', views.create_exam_api, name='exam_create_api'),
]