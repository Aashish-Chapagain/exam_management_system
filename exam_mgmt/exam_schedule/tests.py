import json
from datetime import date, time

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import Exam


class ExamScheduleApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='scheduler_admin',
            password='password123'
        )
        self.client.force_login(self.user)

    def test_scheduler_embeds_existing_exams_for_frontend(self):
        exam = Exam.objects.create(
            term='Spring 2026',
            course='BCA',
            semester=2,
            subject='OOP in Java',
            paper_code='CACS153',
            date=date(2026, 1, 20),
            start_time=time(10, 0),
            duration=120,
            hall='Hall A',
            candidates=50,
            invigilators='Ramesh Shrestha',
            notes='Bring ID card',
        )

        response = self.client.get(reverse('exam_schedule'))

        self.assertEqual(response.status_code, 200)
        self.assertIn('exams_list', response.context)
        self.assertEqual(response.context['exams_list'][0]['id'], exam.id)
        self.assertEqual(response.context['exams_list'][0]['course'], 'BCA')

    def test_create_update_delete_exam_via_api(self):
        create_payload = {
            'term': 'Spring 2026',
            'course': 'BCA',
            'semester': 3,
            'subject': 'Web Technology I',
            'paper_code': 'CACS203',
            'date': '2026-02-01',
            'start_time': '09:00',
            'duration': 90,
            'hall': 'Hall B',
            'candidates': 45,
            'invigilators': 'Mina Rana',
            'notes': 'No smart devices',
        }

        create_response = self.client.post(
            reverse('exam_api'),
            data=json.dumps(create_payload),
            content_type='application/json',
        )

        self.assertEqual(create_response.status_code, 201)
        created_exam_id = create_response.json()['exam']['id']
        self.assertTrue(Exam.objects.filter(id=created_exam_id).exists())

        update_payload = {**create_payload, 'hall': 'Hall C', 'candidates': 48}
        update_response = self.client.put(
            reverse('exam_detail_api', args=[created_exam_id]),
            data=json.dumps(update_payload),
            content_type='application/json',
        )

        self.assertEqual(update_response.status_code, 200)
        updated_exam = Exam.objects.get(id=created_exam_id)
        self.assertEqual(updated_exam.hall, 'Hall C')
        self.assertEqual(updated_exam.candidates, 48)

        delete_response = self.client.delete(reverse('exam_detail_api', args=[created_exam_id]))
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(Exam.objects.filter(id=created_exam_id).exists())
