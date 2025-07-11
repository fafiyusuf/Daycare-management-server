# Daycare Management System

A comprehensive Django REST API for managing daycare operations with role-based access control.

## Features

- **Multi-role Authentication**: Admin, Receptionist, Babysitter, Nurse, Parent
- **Child Management**: Profile management, attendance tracking
- **Activity Logging**: Daily activities, meals, naps, play time
- **Health Records**: Medication tracking, health checks
- **Family Management**: Parent-child relationships
- **Public Portal**: Announcements, gallery, staff profiles
- **Real-time Chat**: Direct messaging between users
- **RESTful APIs**: Complete API coverage for all operations

## User Roles & Permissions

### Admin
- Manage all staff accounts
- Onboard families
- Manage public content (announcements, gallery)
- Full system access

### Receptionist
- Check-in/check-out children
- View attendance records
- Basic child information access

### Babysitter
- Log child activities (meals, naps, play)
- View assigned children
- Update activity records

### Nurse
- Record health events
- Medication tracking
- Health check logging

### Parent
- View child's daily reports
- Update child profile information
- Access child's activity and health logs

## API Endpoints

### Authentication
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `POST /api/password-reset/` - Password reset

### User Management (Admin)
- `GET/POST /api/staff/` - List/Create staff
- `PUT/DELETE /api/staff/{id}/` - Update/Deactivate staff
- `GET/POST /api/families/` - List/Create families
- `PUT /api/parents/{id}/activate/` - Activate parent account
- `POST /api/assign-child/` - Assign child to babysitter

### Attendance (Receptionist)
- `POST /api/attendance/checkin/` - Check in child
- `POST /api/attendance/checkout/` - Check out child
- `GET /api/attendance/{date}/` - View attendance by date

### Activities (Babysitter)
- `GET/POST /api/child-activities/` - List/Create activities
- `PUT/DELETE /api/child-activities/{id}/` - Update/Delete activities

### Health Events (Nurse)
- `GET/POST /api/health-events/` - List/Create health events
- `PUT/DELETE /api/health-events/{id}/` - Update/Delete health events

### Child Profiles (Parent/Admin)
- `GET/PUT /api/children/{id}/` - View/Update child profile
- `GET /api/daily-reports/{child_id}/` - View daily reports

### Public Portal
- `GET /api/public/announcements/` - Public announcements
- `GET /api/public/gallery/` - Public gallery
- `GET /api/public/staff/` - Staff profiles

### Chat System
- `GET /api/chat/users/` - List available users
- `GET /api/chat/{user_id}/messages/` - Get message history
- `POST /api/chat/{user_id}/messages/send/` - Send message
- `GET /api/chat/unread-count/` - Get unread message count

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. **Database Setup**
   - Install PostgreSQL
   - Create database: `createdb daycare_db`
   - Update `.env` file with your database credentials

3. **Run Migrations**
   \`\`\`bash
   python manage.py makemigrations
   python manage.py migrate
   \`\`\`

4. **Create Superuser**
   \`\`\`bash
   python scripts/create_superuser.py
   \`\`\`

5. **Seed Sample Data**
   \`\`\`bash
   python scripts/seed_data.py
   \`\`\`

6. **Run Server**
   \`\`\`bash
   python manage.py runserver
   \`\`\`

## Environment Variables

Create a `.env` file in the project root:

\`\`\`env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=daycare_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
\`\`\`

## Testing

Access the API at `http://localhost:8000/api/`

### Sample Login Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Receptionist**: username: `receptionist1`, password: `password123`
- **Babysitter**: username: `babysitter1`, password: `password123`
- **Nurse**: username: `nurse1`, password: `password123`
- **Parent**: username: `parent1`, password: `password123`

## API Documentation

The API follows RESTful conventions with JWT authentication. All authenticated endpoints require an `Authorization: Bearer <token>` header.

## Real-time Features

The system includes WebSocket support for real-time chat functionality. Connect to WebSocket endpoints for live messaging.

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing
- CORS protection
- Input validation and sanitization
