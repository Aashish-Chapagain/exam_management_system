from django.db import migrations

def add_students(apps, schema_editor):
    Student = apps.get_model('std_account', 'Student')

    names = [
        "Aashish Chapagain", "Bikash Thapa", "Sita Poudel", "Kamal Shrestha",
        "Rina BK", "Suresh Gautam", "Anita Karki", "Rakesh Chaudhary",
        "Binod Bhandari", "Manisha Thapa", "Niraj Rana", "Roshan Khadka",
        "Sangita GC", "Dipesh Basyal", "Sunita Bhatta", "Kiran Gurung",
        "Bibek Karki", "Prakash Sharma", "Sabin Regmi", "Asmita Pandey",
        "Samir Basnet", "Aayush Kharel", "Prerana Singh", "Shivani Pandit",
        "Sandesh Chaudhary", "Anil Bohara", "Shristi Neupane", "Rabina KC",
        "Sanjay Mahato", "Rejina Tamang", "Bimal Lama", "Sarita Oli",
        "Sudip Pandey", "Nisha Bista", "Laxman Regmi"
    ]

    total = len(names)
    paid_count = int(total * 0.70)
    paid_students = set(names[:paid_count])

    for name in names:
        Student.objects.create(
            name=name,
            fees_paid=(name in paid_students)
        )


def remove_students(apps, schema_editor):
    Student = apps.get_model('std_account', 'Student')
    Student.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('std_account', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_students, remove_students),
    ]
