from django.core.management.base import BaseCommand
from admit_stds.models import AdmittedStudent


class Command(BaseCommand):
    help = 'Clear all admitted students data'

    def handle(self, *args, **options):
        count = AdmittedStudent.objects.count()
        
        if count == 0:
            self.stdout.write(self.style.WARNING('No admitted students to delete.'))
            return
        
        AdmittedStudent.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {count} admitted student(s).')
        )
        self.stdout.write(
            self.style.SUCCESS('You can now re-add admitted students with correct semester information.')
        )
