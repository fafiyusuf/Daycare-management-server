from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('daycare_app', '0004_child_vaccination_card'),
    ]

    operations = [
        migrations.AlterField(
            model_name='childactivity',
            name='activity_type',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='healthevent',
            name='event_type',
            field=models.CharField(max_length=50),
        ),
    ]
