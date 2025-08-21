from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('daycare_app', '0006_incidentlog'),
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('role_applied', models.CharField(choices=[('receptionist', 'Receptionist'), ('babysitter', 'Babysitter'), ('nurse', 'Nurse'), ('parent', 'Parent')], max_length=20)),
                ('child_age_months', models.PositiveIntegerField(blank=True, null=True)),
                ('reason', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(default='new', max_length=20)),
            ],
        ),
    ]
