from datetime import date, time

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from exam_schedule.models import Exam
from .models import Hall, SeatPlan, Student


class SeatPlanViewTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='admin',
            password='password123',
        )
        self.exam = Exam.objects.create(
            term='Mid',
            course='BSc',
            semester=1,
            subject='Math',
            date=date(2025, 1, 10),
            start_time=time(9, 0),
            candidates=10,
        )
        self.hall = Hall.objects.create(name='Main Hall', rows=2, cols=2)
        self.students = [
            Student.objects.create(name=f'Student {i}', roll_no=f'R{i:03d}')
            for i in range(1, 7)
        ]

    def test_create_hall_requires_login(self):
        response = self.client.get(reverse('seatplan_create_hall'))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse('admin_login'), response.url)

    def test_generate_seatplan_respects_hall_capacity(self):
        self.client.force_login(self.user)

        response = self.client.get(
            reverse('generate_seatplan', args=[self.exam.id, self.hall.id])
        )

        self.assertEqual(response.status_code, 302)
        plans = SeatPlan.objects.filter(exam=self.exam, hall=self.hall)
        self.assertEqual(plans.count(), 4)
        assigned_rolls = set(plans.values_list('student__roll_no', flat=True))
        self.assertEqual(assigned_rolls, {'R001', 'R002', 'R003', 'R004'})

    def test_generate_seatplan_returns_404_for_invalid_exam_or_hall(self):
        self.client.force_login(self.user)

        missing_exam_response = self.client.get(
            reverse('generate_seatplan', args=[9999, self.hall.id])
        )
        missing_hall_response = self.client.get(
            reverse('generate_seatplan', args=[self.exam.id, 9999])
        )

        self.assertEqual(missing_exam_response.status_code, 404)
        self.assertEqual(missing_hall_response.status_code, 404)
