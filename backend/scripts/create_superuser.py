#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'daycare_project.settings')
django.setup()

from daycare_app.models import User

# Create superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@daycare.com',
        password='admin123',
        role='admin',
        first_name='Admin',
        last_name='User'
    )
    print("Superuser created successfully!")
else:
    print("Superuser already exists!")
