from django.urls import path

from . import views

urlpatterns = [
    path('', views.scheduler, name='exam_schedule'),
    path('auto-fill/', views.auto_fill, name='exam_auto_fill'),
    path('api/exams/', views.exams_api, name='exam_api'),
    path('api/exams/<int:exam_id>/', views.exam_detail_api, name='exam_detail_api'),
]
