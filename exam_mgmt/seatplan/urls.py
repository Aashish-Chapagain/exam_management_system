from django.urls import path
from . import views


urlpatterns = [
     path('', views.home, name="seatplan_home"),

     # selection page
     path('select/', views.select_exam_hall, name="seatplan_select"),
     path('create/', views.create_hall, name='seatplan_create_hall'),

     # actions
     path('generate/<int:exam_id>/<int:hall_id>/', views.generate_seatplan, name="generate_seatplan"),
     path('view/<int:exam_id>/<int:hall_id>/', views.view_seatplan, name="view_seatplan"),
]
