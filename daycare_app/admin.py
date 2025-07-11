from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active_staff']
    list_filter = ['role', 'is_active', 'is_active_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'is_active_staff', 'profile_picture', 'bio')}),
    )

@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ['name', 'emergency_contact', 'created_at']

@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'date_of_birth', 'family', 'assigned_babysitter', 'is_active']
    list_filter = ['is_active', 'assigned_babysitter']
    filter_horizontal = ['parents']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['child', 'check_in_time', 'check_out_time', 'checked_in_by']
    list_filter = ['check_in_time']

@admin.register(ChildActivity)
class ChildActivityAdmin(admin.ModelAdmin):
    list_display = ['child', 'activity_type', 'start_time', 'logged_by']
    list_filter = ['activity_type', 'start_time']

@admin.register(HealthEvent)
class HealthEventAdmin(admin.ModelAdmin):
    list_display = ['child', 'event_type', 'timestamp', 'recorded_by']
    list_filter = ['event_type', 'timestamp']

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['title', 'uploaded_by', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']

@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'experience_years', 'is_public']
    list_filter = ['is_public']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'timestamp', 'is_read']
    list_filter = ['timestamp', 'is_read']
