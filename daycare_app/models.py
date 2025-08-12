from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    USER_ROLES = [
        ('admin', 'Admin'),
        ('receptionist', 'Receptionist'),
        ('babysitter', 'Babysitter'),
        ('nurse', 'Nurse'),
        ('parent', 'Parent'),
    ]
    
    role = models.CharField(max_length=20, choices=USER_ROLES)
    phone = models.CharField(max_length=15, blank=True)
    is_active_staff = models.BooleanField(default=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Family(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    emergency_contact = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Child(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='children')
    parents = models.ManyToManyField(User, limit_choices_to={'role': 'parent'}, related_name='children')
    assigned_babysitter = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'role': 'babysitter'},
        related_name='assigned_children'
    )
    medical_info = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=15)
    profile_picture = models.ImageField(upload_to='children/', blank=True, null=True)
    birth_certificate = models.FileField(upload_to='birth_certificates/', blank=True, null=True)
    vaccination_card = models.FileField(upload_to='vaccination_cards/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        # Enforce babysitter capacity (max 5 active children)
        if self.assigned_babysitter_id:
            babysitter = self.assigned_babysitter
            # Count other active children already assigned to this babysitter
            qs = Child.objects.filter(assigned_babysitter=babysitter, is_active=True)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            if qs.count() >= 5:
                raise ValueError("This babysitter already has the maximum of 5 active children assigned.")
        super().save(*args, **kwargs)

class Attendance(models.Model):
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='attendance_records')
    check_in_time = models.DateTimeField()
    check_out_time = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='check_ins',
        limit_choices_to={'role': 'receptionist'}
    )
    checked_out_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='check_outs',
        limit_choices_to={'role': 'receptionist'}
    )
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.child} - {self.check_in_time.date()}"

class ChildActivity(models.Model):
    # activity_type changed to free-form text (previously constrained by ACTIVITY_TYPES choices)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50)  # Free input now
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    logged_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'babysitter'}
    )
    notes = models.TextField(blank=True)
    photos = models.ImageField(upload_to='activities/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.child} - {self.activity_type} - {self.start_time.date()}"

class HealthEvent(models.Model):
    # event_type changed to free-form text (previously constrained by EVENT_TYPES choices)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='health_events')
    event_type = models.CharField(max_length=50)  # Free input now
    description = models.TextField()
    medication_name = models.CharField(max_length=100, blank=True)
    dosage = models.CharField(max_length=50, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    recorded_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'nurse'}
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.child} - {self.event_type} - {self.timestamp.date()}"

class Announcement(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'admin'})
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class Gallery(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to='gallery/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    bio = models.TextField()
    qualifications = models.TextField(blank=True)
    experience_years = models.IntegerField(default=0)
    specialties = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} Profile"

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender} to {self.recipient} - {self.timestamp}"
