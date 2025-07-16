# daycare_app/views.py

from rest_framework import generics, status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, date
from .models import *
from .serializers import * # Make sure all your serializers are imported
from .permissions import * # Ensure all your permission classes are imported

# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
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
    # This is a placeholder. A real password reset would involve
    # sending an email with a reset link/token.
    # For now, we'll just acknowledge the request.
    email = request.data.get('email')
    if email:
        return Response({"message": f"Password reset initiated for {email}. (Feature not fully implemented)"}, status=status.HTTP_200_OK)
    return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

# --- User Management Views ---
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

class StaffViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role__in=['admin', 'receptionist', 'babysitter', 'nurse'])
    serializer_class = StaffCreateSerializer # Use StaffCreateSerializer for creating staff
    permission_classes = [IsAdminUser] # Only admin can manage staff

    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        return UserSerializer # Use UserSerializer for retrieving/updating staff details


class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [IsAdminOrReceptionist] # Admin and Receptionist can manage families

class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [permissions.IsAuthenticated] # Base permission, refined by get_permissions

    def get_permissions(self):
        """
        Permissions for Child:
        - Admin: Can manage all children (create, view, update, delete).
        - Receptionist: Can create, view, update children.
        - Babysitter: Can view assigned children.
        - Parent: Can view their own children.
        """
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsAdminOrReceptionist]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [IsAdminOrReceptionist | IsBabysitterUser | IsParentUser]
        elif self.action == 'destroy':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'parent':
                return queryset.filter(parents=user)
            elif user.role == 'babysitter':
                return queryset.filter(assigned_babysitter=user)
            elif user.role in ['admin', 'receptionist', 'nurse']:
                return queryset # Staff roles can see all children
        return Child.objects.none() # No children for unauthenticated users


@api_view(['POST'])
@permission_classes([IsAdminUser])
def activate_parent(request, pk):
    try:
        parent = User.objects.get(pk=pk, role='parent')
        parent.is_active = True
        parent.save()
        return Response({"message": f"Parent {parent.username} activated successfully."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Parent not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminOrReceptionist])
def assign_child(request):
    child_id = request.data.get('child_id')
    parent_id = request.data.get('parent_id')
    babysitter_id = request.data.get('babysitter_id')

    try:
        child = Child.objects.get(pk=child_id)
    except Child.DoesNotExist:
        return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

    if parent_id:
        try:
            parent = User.objects.get(pk=parent_id, role='parent')
            child.parents.add(parent)
            child.save()
            return Response({"message": f"Child {child.first_name} assigned to parent {parent.username}."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Parent not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if babysitter_id:
        try:
            babysitter = User.objects.get(pk=babysitter_id, role='babysitter')
            child.assigned_babysitter = babysitter
            child.save()
            return Response({"message": f"Child {child.first_name} assigned to babysitter {babysitter.username}."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Babysitter not found"}, status=status.HTTP_404_NOT_FOUND)
            
    return Response({"error": "No parent_id or babysitter_id provided."}, status=status.HTTP_400_BAD_REQUEST)

# --- Attendance Management ---
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsReceptionistUser]
    
    def perform_create(self, serializer):
        serializer.save(checked_in_by=self.request.user)

    @action(detail=False, methods=['post'])
    def checkin(self, request):
        child_id = request.data.get('child_id')
        if not child_id:
            return Response({"error": "Child ID is required for check-in"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            child = Child.objects.get(pk=child_id)
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
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        child_id = request.data.get('child_id')
        if not child_id:
            return Response({"error": "Child ID is required for check-out"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            child = Child.objects.get(pk=child_id)
            attendance = Attendance.objects.filter(
                child=child,
                check_in_time__date=timezone.now().date(),
                check_out_time__isnull=True
            ).first()
            
            if not attendance:
                return Response({"error": "No active check-in found for this child today"}, status=status.HTTP_400_BAD_REQUEST)
            
            attendance.check_out_time = timezone.now()
            attendance.checked_out_by = request.user
            attendance.save()
            return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)
        except Child.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def attendance_by_date(request, date_str):
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    attendance_records = Attendance.objects.filter(check_in_time__date=target_date)
    serializer = AttendanceSerializer(attendance_records, many=True)
    return Response(serializer.data)


# --- Child Activity Management ---
class ChildActivityViewSet(viewsets.ModelViewSet):
    queryset = ChildActivity.objects.all()
    serializer_class = ChildActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsBabysitterUser | IsAdminUser]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [IsBabysitterUser | IsParentUser | IsAdminUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(logged_by=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_authenticated:
            if user.role == 'babysitter':
                return queryset.filter(child__assigned_babysitter=user)
            elif user.role == 'parent':
                return queryset.filter(child__parents=user)
            elif user.role == 'admin':
                return queryset
        return ChildActivity.objects.none()


# --- Health Event Management ---
class HealthEventViewSet(viewsets.ModelViewSet):
    queryset = HealthEvent.objects.all()
    serializer_class = HealthEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsNurseUser | IsAdminUser]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [IsNurseUser | IsParentUser | IsAdminUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_authenticated:
            if user.role == 'nurse':
                return queryset
            elif user.role == 'parent':
                return queryset.filter(child__parents=user)
            elif user.role == 'admin':
                return queryset
        return HealthEvent.objects.none()


# --- Daily Reports Aggregation View ---
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def daily_reports(request, child_id, date_str=None):
    try:
        child = Child.objects.get(pk=child_id)
    except Child.DoesNotExist:
        return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user.role == 'parent' and child not in user.children.all():
        return Response({"error": "You do not have permission to view this child's daily report."}, status=status.HTTP_403_FORBIDDEN)
    if user.role == 'babysitter' and child.assigned_babysitter != user:
        return Response({"error": "You are not assigned to this child."}, status=status.HTTP_403_FORBIDDEN)
    if not (user.role == 'admin' or (user.role == 'parent' and child in user.children.all()) or (user.role == 'babysitter' and child.assigned_babysitter == user)):
        return Response({"error": "You do not have permission to view daily reports."}, status=status.HTTP_403_FORBIDDEN)

    report_date_str = request.query_params.get('date', date_str)

    if not report_date_str:
        report_date = timezone.now().date()
    else:
        try:
            report_date = datetime.strptime(report_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    activities = ChildActivity.objects.filter(
        child=child,
        start_time__date=report_date
    ).order_by('start_time')

    health_events = HealthEvent.objects.filter(
        child=child,
        timestamp__date=report_date
    ).order_by('timestamp')

    report_data = {
        'child_id': child.id,
        'child_name': f"{child.first_name} {child.last_name}",
        'date': report_date,
        'activities': activities,
        'health_events': health_events
    }
    
    serializer = DailyReportSerializer(report_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


# --- Announcement Management ---
class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only Admin or Receptionist can manage announcements
            permission_classes = [IsAdminOrReceptionist]
        else: # For list and retrieve
            # All authenticated users can view announcements
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Automatically set the author to the current authenticated user
        serializer.save(author=self.request.user)


# --- Gallery Management ---
class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only Admin or Receptionist can manage gallery items
            permission_classes = [IsAdminOrReceptionist]
        else: # For list and retrieve
            # All authenticated users can view gallery (or IsPublic for public view)
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Automatically set the uploader to the current authenticated user
        serializer.save(uploaded_by=self.request.user)


# --- Staff Profile Management ---
class StaffProfileViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only Admin can manage staff profiles
            permission_classes = [IsAdminUser]
        elif self.action in ['list', 'retrieve']:
            # Staff can view their own profile, Admin can view all. Public staff view is separate.
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_authenticated and user.role != 'admin':
            # Staff users can only see their own profile in this viewset
            # Admins can see all, handled by default queryset
            if user.role in ['receptionist', 'babysitter', 'nurse']:
                queryset = queryset.filter(user=user)
            elif user.role == 'parent':
                # Parents should not typically view staff profiles via this endpoint
                # (public_staff view is for public access)
                queryset = StaffProfile.objects.none() # Or raise permission denied
        return queryset


# --- Public Portal Views ---
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
    staff_profiles = StaffProfile.objects.filter(is_public=True).select_related('user')
    serializer = StaffProfileSerializer(staff_profiles, many=True)
    return Response(serializer.data)

# --- System Views ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_status(request):
    # Example status metrics
    user_count = User.objects.count()
    child_count = Child.objects.count()
    active_children_today = Attendance.objects.filter(check_in_time__date=timezone.now().date(), check_out_time__isnull=True).count()
    
    return Response({
        "status": "Operational",
        "user_count": user_count,
        "child_count": child_count,
        "active_children_today": active_children_today,
        "server_time": timezone.now()
    }, status=status.HTTP_200_OK)

# --- Chat Functionality ---
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chat_users(request):
    """
    Get a list of all users excluding the requesting user, for chat purposes.
    Admins see all users. Staff see other staff and parents. Parents see staff.
    """
    user = request.user
    if user.role == 'admin':
        users = User.objects.exclude(id=user.id).order_by('first_name')
    elif user.role in ['receptionist', 'babysitter', 'nurse']:
        # Staff can chat with other staff and parents
        users = User.objects.filter(Q(role__in=['admin', 'receptionist', 'babysitter', 'nurse']) | Q(role='parent')).exclude(id=user.id).order_by('first_name')
    elif user.role == 'parent':
        # Parents can chat with staff (admin, receptionist, babysitter, nurse)
        users = User.objects.filter(role__in=['admin', 'receptionist', 'babysitter', 'nurse']).exclude(id=user.id).order_by('first_name')
    else:
        return Response({"error": "Unauthorized access to chat users."}, status=status.HTTP_403_FORBIDDEN)
        
    serializer = ChatUserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chat_conversations(request):
    """Get list of conversations (users you've chatted with)"""
    user = request.user
    
    # Get users who have sent or received messages from current user
    sent_to_ids = ChatMessage.objects.filter(sender=user).values_list('recipient__id', flat=True).distinct()
    received_from_ids = ChatMessage.objects.filter(recipient=user).values_list('sender__id', flat=True).distinct()
    
    all_chatted_user_ids = set(list(sent_to_ids) + list(received_from_ids))
    
    # Exclude the current user from the list of conversation partners
    chatted_with_users = User.objects.filter(id__in=all_chatted_user_ids).exclude(id=user.id).order_by('first_name')
    
    serializer = ChatUserSerializer(chatted_with_users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chat_messages(request, user_id):
    """Get messages between current user and a specific user"""
    try:
        other_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Messages sent by current user to other_user OR sent by other_user to current user
    messages = ChatMessage.objects.filter(
        Q(sender=request.user, recipient=other_user) |
        Q(sender=other_user, recipient=request.user)
    ).order_by('timestamp')

    # Mark messages sent by other_user to current_user as read
    ChatMessage.objects.filter(sender=other_user, recipient=request.user, is_read=False).update(is_read=True)
    
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat_send(request, user_id):
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
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """Get total unread message count"""
    count = ChatMessage.objects.filter(recipient=request.user, is_read=False).count()
    return Response({"unread_count": count})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chat_conversations(request):
    """Get list of conversations (users you've chatted with)"""
    # Get users who have sent or received messages from current user
    sent_to = ChatMessage.objects.filter(sender=request.user).values_list('recipient', flat=True).distinct()
    received_from = ChatMessage.objects.filter(recipient=request.user).values_list('sender', flat=True).distinct()
    
    user_ids = set(list(sent_to) + list(received_from))
    users = User.objects.filter(id__in=user_ids)
    
    serializer = ChatUserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)