from django.urls import path 
from . import views


urlpatterns = [
    path('', views.scheduler, name = 'exam_schedule'),
]