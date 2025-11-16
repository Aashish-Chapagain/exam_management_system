from django.urls import path, include
from . import views


url_patterns = [
    path('seatplam/generate/<int:exam_id>/<int:hall_id>/', views.generate_seatplan, name='generate_seatplan'),
    path('view/<int:exam_id>/<int:hall_id>/', views.view_seatplan, name='view_seatplan'),
]