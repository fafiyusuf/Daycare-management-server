from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Explicitly set the basename for UserViewSet if you want 'users' to be its prefix
router.register(r'users', views.UserViewSet) 
# Explicitly set the basename for StaffViewSet to 'staff' 
# because its URL prefix is 'staff' and its queryset is also 'User'
router.register(r'staff', views.StaffViewSet, basename='staff') # <--- ADD basename='staff' here
router.register(r'families', views.FamilyViewSet)
router.register(r'children', views.ChildViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'child-activities', views.ChildActivityViewSet)
router.register(r'health-events', views.HealthEventViewSet)
router.register(r'announcements', views.AnnouncementViewSet)
router.register(r'gallery', views.GalleryViewSet)
router.register(r'staff-profiles', views.StaffProfileViewSet)

urlpatterns = [
    # Authentication
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    
    # User Management
    path('parents/<int:pk>/activate/', views.activate_parent, name='activate_parent'),
    path('assign-child/', views.assign_child, name='assign_child'),
    
    # Attendance
    path('attendance/<str:date_str>/', views.attendance_by_date, name='attendance_by_date'),
    
    # Daily Reports
    path('daily-reports/<int:child_id>/', views.daily_reports, name='daily_reports'),
    
    # Public Portal
    path('public/announcements/', views.public_announcements, name='public_announcements'),
    path('public/gallery/', views.public_gallery, name='public_gallery'),
    path('public/staff/', views.public_staff, name='public_staff'),
    
    # System
    path('system/status/', views.system_status, name='system_status'),
    
    # Chat - Simple direct messaging
    path('chat/users/', views.chat_users, name='chat_users'),
    path('chat/conversations/', views.chat_conversations, name='chat_conversations'),
    path('chat/<int:user_id>/messages/', views.chat_messages, name='chat_messages'),
    path('chat/<int:user_id>/send/', views.send_message, name='send_message'),
    path('chat/unread-count/', views.unread_count, name='unread_count'),
    
    # Router URLs (ensure this is always at the end, so specific paths are matched first)
    path('', include(router.urls)),
]