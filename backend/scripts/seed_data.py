#!/usr/bin/env python
import os
import django
from datetime import date, datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'daycare_project.settings')
django.setup()

from daycare_app.models import *

# Create sample users
def create_sample_users():
    # Create staff users
    receptionist = User.objects.create_user(
        username='receptionist1',
        email='receptionist@daycare.com',
        password='password123',
        role='receptionist',
        first_name='Jane',
        last_name='Smith'
    )
    
    babysitter = User.objects.create_user(
        username='babysitter1',
        email='babysitter@daycare.com',
        password='password123',
        role='babysitter',
        first_name='Mary',
        last_name='Johnson'
    )
    
    nurse = User.objects.create_user(
        username='nurse1',
        email='nurse@daycare.com',
        password='password123',
        role='nurse',
        first_name='Sarah',
        last_name='Wilson'
    )
    
    parent = User.objects.create_user(
        username='parent1',
        email='parent@daycare.com',
        password='password123',
        role='parent',
        first_name='John',
        last_name='Doe'
    )
    
    print("Sample users created!")
    return receptionist, babysitter, nurse, parent

def create_sample_families_and_children(parent, babysitter):
    # Create family
    family = Family.objects.create(
        name='Doe Family',
        address='123 Main St, City, State',
        emergency_contact='555-0123'
    )
    
    # Create child
    child = Child.objects.create(
        first_name='Emma',
        last_name='Doe',
        date_of_birth=date(2020, 5, 15),
        family=family,
        assigned_babysitter=babysitter,
        medical_info='No known allergies',
        emergency_contact='555-0123'
    )
    
    child.parents.add(parent)
    
    print("Sample family and child created!")
    return family, child

def create_sample_announcements():
    admin = User.objects.filter(role='admin').first()
    if admin:
        Announcement.objects.create(
            title='Welcome to Our Daycare!',
            content='We are excited to welcome all families to our daycare center.',
            author=admin,
            is_public=True
        )
        print("Sample announcement created!")

if __name__ == '__main__':
    receptionist, babysitter, nurse, parent = create_sample_users()
    family, child = create_sample_families_and_children(parent, babysitter)
    create_sample_announcements()
    print("Sample data seeding completed!")
