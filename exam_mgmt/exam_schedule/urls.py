from django.urls import path 
from . import views


urlpatterns = [
    path('', views.scheduler, name = 'exam_schedule'),
    path('auto-fill/', views.auto_fill, name='exam_auto_fill'),
]