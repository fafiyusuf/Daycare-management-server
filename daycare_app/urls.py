# daycare_app/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet) 
router.register(r'staff', views.StaffViewSet, basename='staff')
router.register(r'families', views.FamilyViewSet)
router.register(r'children', views.ChildViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'child-activities', views.ChildActivityViewSet)
router.register(r'health-events', views.HealthEventViewSet)
router.register(r'incident-logs', views.IncidentLogViewSet)
router.register(r'announcements', views.AnnouncementViewSet)
router.register(r'gallery', views.GalleryViewSet)
router.register(r'staff-profiles', views.StaffProfileViewSet)
router.register(r'applications', views.ApplicationViewSet, basename='applications')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # --- Authentication (The fix is here) ---
    # The login view that gives the initial token pair
    # Note: You can still use your custom login view if it's more complex,
    # but this is the standard way.
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # This is the missing URL for refreshing the token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    
    # User Management
    path('parents/<int:pk>/activate/', views.activate_parent, name='activate_parent'),
    path('assign-child/', views.assign_child, name='assign_child'),
    
    # Daily Reports
    path('daily-reports/<int:child_id>/', views.daily_reports, name='daily_reports'),
    path('daily-reports/<int:child_id>/<str:date_str>/', views.daily_reports, name='daily_reports_by_date'),
    
    # Public Portal
    path('public/announcements/', views.public_announcements, name='public_announcements'),
    path('public/gallery/', views.public_gallery, name='public_gallery'),
    path('public/staff/', views.public_staff, name='public_staff'),
    path('public/apply/', views.public_apply, name='public_apply'),
    
    # System
    path('system/status/', views.system_status, name='system_status'),
    
    # Chat - Simple direct messaging
    path('chat/users/', views.chat_users, name='chat_users'),
    path('chat/conversations/', views.chat_conversations, name='chat_conversations'),
    path('chat/<int:user_id>/messages/', views.chat_messages, name='chat_messages'),
    path('chat/<int:user_id>/send/', views.chat_send, name='send_message'),
    path('chat/unread-count/', views.unread_count, name='unread_count'),
    path('chat/<int:user_id>/mark-as-read/', views.mark_messages_as_read, name='mark_messages_as_read'),
]