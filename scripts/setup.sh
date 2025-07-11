#!/bin/bash

echo "Setting up Django Daycare Management System..."

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python scripts/create_superuser.py

# Seed sample data
python scripts/seed_data.py

# Collect static files
python manage.py collectstatic --noinput

echo "Setup completed! You can now run the server with: python manage.py runserver"
