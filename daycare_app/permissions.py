# daycare_app/permissions.py

from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsReceptionistUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'receptionist'

class IsBabysitterUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'babysitter'

class IsNurseUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'nurse'

class IsParentUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'parent'

class IsAdminOrReceptionist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'receptionist']

class IsStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'receptionist', 'babysitter', 'nurse']

# daycare_app/permissions.py
class IsNurseAndOwner(permissions.BasePermission):
    """
    Custom permission to only allow nurses to edit/delete their own HealthEvent.
    Admins can always edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        # Admins can always perform any action
        if request.user.role == 'admin':
            return True

        # If it's a nurse, they can only modify/delete if they are the 'recorded_by' user
        if request.user.role == 'nurse':
            return obj.recorded_by == request.user
        
        # Deny access for other roles
        return False

class CanManageAttendance(permissions.BasePermission):
    """
    Custom permission to allow admin, receptionist, and babysitter to manage attendance.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'receptionist', 'babysitter']