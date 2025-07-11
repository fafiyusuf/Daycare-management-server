from rest_framework import generics, status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, date
from .models import *
from .serializers import * # Make sure UserSerializer, StaffCreateSerializer, LoginSerializer are imported
from .permissions import * # Ensure IsAdminUser, AllowAny, IsAuthenticated are available

# --- NEW: UserViewSet for general User API operations ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
            """
            Set permissions based on the action.
            - 'create': Only Admin can create new users (as per your specific requirement).
            - 'list', 'retrieve': Authenticated users can view.
            - 'update', 'partial_update', 'destroy': Only admin can modify/delete.
            """
            # Ensure only permission CLASSES are in the list
            if self.action == 'create':
                permission_classes = [IsAdminUser] 
            elif self.action in ['list', 'retrieve']:
                permission_classes = [permissions.IsAuthenticated] 
            else: # For 'update', 'partial_update', 'destroy'
                permission_classes = [IsAdminUser] 
            return [permission() for permission in permission_classes]

# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data, context={'request': request}) # Pass request to serializer
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_view(request):
    # Implement password reset logic here
    email = request.data.get('email')
    if email:
        # Send password reset email logic
        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)
    return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

# Staff Management Views (Admin Only)
class StaffViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role__in=['receptionist', 'babysitter', 'nurse'])
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        return UserSerializer
    
    def destroy(self, request, *args, **kwargs):
        # Deactivate instead of delete
        instance = self.get_object()
        instance.is_active_staff = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [IsAdminUser]

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def activate_parent(request, pk):
    try:
        parent = User.objects.get(pk=pk, role='parent')
        parent.is_active = True
        parent.save()
        return Response({"message": "Parent account activated"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Parent not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def assign_child(request):
    child_id = request.data.get('child_id')
    babysitter_id = request.data.get('babysitter_id')
    
    try:
        child = Child.objects.get(pk=child_id)
        babysitter = User.objects.get(pk=babysitter_id, role='babysitter')
        child.assigned_babysitter = babysitter
        child.save()
        return Response({"message": "Child assigned successfully"}, status=status.HTTP_200_OK)
    except (Child.DoesNotExist, User.DoesNotExist):
        return Response({"error": "Child or Babysitter not found"}, status=status.HTTP_404_NOT_FOUND)

# Attendance Management (Receptionist)
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsReceptionistUser]
    
    @action(detail=False, methods=['post'])
    def checkin(self, request):
        child_id = request.data.get('child_id')
        try:
            child = Child.objects.get(pk=child_id)
            # Check if child is already checked in
            existing_attendance = Attendance.objects.filter(
                child=child, 
                check_in_time__date=timezone.now().date(),
                check_out_time__isnull=True
            ).first()
            
            if existing_attendance:
                return Response({"error": "Child is already checked in"}, status=status.HTTP_400_BAD_REQUEST)
            
            attendance = Attendance.objects.create(
                child=child,
                check_in_time=timezone.now(),
                checked_in_by=request.user,
                notes=request.data.get('notes', '')
            )
            return Response(AttendanceSerializer(attendance).data, status=status.HTTP_201_CREATED)
        except Child.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        child_id = request.data.get('child_id')
        try:
            child = Child.objects.get(pk=child_id)
            attendance = Attendance.objects.filter(
                child=child,
                check_in_time__date=timezone.now().date(),
                check_out_time__isnull=True
            ).first()
            
            if not attendance:
                return Response({"error": "No active check-in found for this child"}, status=status.HTTP_400_BAD_REQUEST)
            
            attendance.check_out_time = timezone.now()
            attendance.checked_out_by = request.user
            attendance.save()
            return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)
        except Child.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsReceptionistUser])
def attendance_by_date(request, date_str):
    try:
        attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        attendance_records = Attendance.objects.filter(check_in_time__date=attendance_date)
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response(serializer.data)
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

# Child Activity Logging (Babysitter)
class ChildActivityViewSet(viewsets.ModelViewSet):
    queryset = ChildActivity.objects.all()
    serializer_class = ChildActivitySerializer
    permission_classes = [IsBabysitterUser]
    
    def perform_create(self, serializer):
        serializer.save(logged_by=self.request.user)
    
    def get_queryset(self):
        # Babysitters can only see activities for their assigned children
        return ChildActivity.objects.filter(child__assigned_babysitter=self.request.user)

# Health Event Logging (Nurse)
class HealthEventViewSet(viewsets.ModelViewSet):
    queryset = HealthEvent.objects.all()
    serializer_class = HealthEventSerializer
    permission_classes = [IsNurseUser]
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

# Child Profile Management (Parent)
class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsStaffUser | IsParentUser]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsParentUser | IsAdminUser]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        if self.request.user.role == 'parent':
            return Child.objects.filter(parents=self.request.user)
        elif self.request.user.role == 'babysitter':
            return Child.objects.filter(assigned_babysitter=self.request.user)
        return Child.objects.all()

@api_view(['GET'])
@permission_classes([IsParentUser | IsStaffUser])
def daily_reports(request, child_id):
    try:
        child = Child.objects.get(pk=child_id)
        
        # Check if parent has access to this child
        if request.user.role == 'parent' and request.user not in child.parents.all():
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        
        today = timezone.now().date()
        activities = ChildActivity.objects.filter(child=child, start_time__date=today)
        health_events = HealthEvent.objects.filter(child=child, timestamp__date=today)
        
        return Response({
            'child': ChildSerializer(child).data,
            'activities': ChildActivitySerializer(activities, many=True).data,
            'health_events': HealthEventSerializer(health_events, many=True).data,
        })
    except Child.DoesNotExist:
        return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

# Public Portal Views
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_announcements(request):
    announcements = Announcement.objects.filter(is_public=True).order_by('-created_at')
    serializer = AnnouncementSerializer(announcements, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_gallery(request):
    gallery_items = Gallery.objects.filter(is_public=True).order_by('-created_at')
    serializer = GallerySerializer(gallery_items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_staff(request):
    staff_profiles = StaffProfile.objects.filter(is_public=True)
    serializer = StaffProfileSerializer(staff_profiles, many=True)
    return Response(serializer.data)

# Admin-specific public content management
class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class StaffProfileViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAdminUser]

# System Status
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def system_status(request):
    return Response({
        "status": "online",
        "timestamp": timezone.now(),
        "version": "1.0.0"
    })

# Simple Chat APIs
@api_view(['GET'])
def chat_users(request):
    """Get list of users to chat with"""
    users = User.objects.exclude(id=request.user.id).filter(is_active=True)
    serializer = ChatUserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def chat_messages(request, user_id):
    """Get message history with a specific user"""
    try:
        other_user = User.objects.get(pk=user_id)
        messages = ChatMessage.objects.filter(
            Q(sender=request.user, recipient=other_user) |
            Q(sender=other_user, recipient=request.user)
        ).order_by('timestamp')
        
        # Mark messages as read
        ChatMessage.objects.filter(
            sender=other_user, 
            recipient=request.user, 
            is_read=False
        ).update(is_read=True)
        
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def send_message(request, user_id):
    """Send a message to a specific user"""
    try:
        recipient = User.objects.get(pk=user_id)
        
        # Create message
        message = ChatMessage.objects.create(
            sender=request.user,
            recipient=recipient,
            message=request.data.get('message', ''),
            image=request.data.get('image'),
            file=request.data.get('file')
        )
        
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def unread_count(request):
    """Get total unread message count"""
    count = ChatMessage.objects.filter(recipient=request.user, is_read=False).count()
    return Response({"unread_count": count})

@api_view(['GET'])
def chat_conversations(request):
    """Get list of conversations (users you've chatted with)"""
    # Get users who have sent or received messages from current user
    sent_to = ChatMessage.objects.filter(sender=request.user).values_list('recipient', flat=True).distinct()
    received_from = ChatMessage.objects.filter(recipient=request.user).values_list('sender', flat=True).distinct()
    
    user_ids = set(list(sent_to) + list(received_from))
    users = User.objects.filter(id__in=user_ids)
    
    serializer = ChatUserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)