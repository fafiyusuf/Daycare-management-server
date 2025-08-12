# daycare_app/serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *
from django.db.models import Q
from datetime import date
from dateutil.relativedelta import relativedelta

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active_staff', 'profile_picture', 'bio', 'password', 'is_public'] # Added 'is_public'
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}, # 'required': False allows updates without changing password
            'is_active_staff': {'required': False},
            'profile_picture': {'required': False, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
            'is_public': {'required': False},
        }

    def create(self, validated_data):
        # Use create_user for proper password hashing
        password = validated_data.pop('password', None)
        if password:
            user = User.objects.create_user(**validated_data)
            user.set_password(password) # set_password handles hashing
        else:
            user = User.objects.create(**validated_data) # For users without password, if applicable
        user.save()
        return user

    def update(self, instance, validated_data):
        # Handle password update separately if provided
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')
        
        return data

class StaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'password', 'is_public'] # Added 'is_public'
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.is_active_staff = True # New staff created should be active staff
        user.save()
        return user

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = '__all__'

class BabysitterSerializer(serializers.ModelSerializer):
    """Serializer for basic babysitter info."""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone']

# Corrected ChildSerializer
class ChildSerializer(serializers.ModelSerializer):

    # This field is for output only.
    parents = UserSerializer(many=True, read_only=True)
    assigned_babysitter = BabysitterSerializer(read_only=True)
    family = FamilySerializer(read_only=True)
    
    # This is for input during create/update
    parent_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    family_id = serializers.PrimaryKeyRelatedField(
        queryset=Family.objects.all(), source='family', write_only=True, required=False, allow_null=True
    )
    assigned_babysitter_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='babysitter'), source='assigned_babysitter', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Child
        fields = [
            'id', 'first_name', 'last_name', 'date_of_birth', 'family', 'family_id',
            'parents', 'parent_ids', 'assigned_babysitter', 'assigned_babysitter_id', 'medical_info', 'allergies',
            'emergency_contact', 'profile_picture', 'is_active', 'created_at', 'birth_certificate', 'vaccination_card'
        ]
        extra_kwargs = {
            'parents': {'read_only': True},
            'assigned_babysitter': {'read_only': True},
            'family': {'read_only': True},
            'medical_info': {'required': False, 'allow_blank': True},
            'allergies': {'required': False, 'allow_blank': True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Provide friendly fallbacks only if truly empty
        if not data.get('medical_info'):
            data['medical_info'] = "No medical information provided."
        if not data.get('allergies'):
            data['allergies'] = "No known allergies."
        return data

    def validate(self, data):
        """
        Check that a child with the same first_name, last_name, and date_of_birth
        does not already exist, and that the child is between 4 months and 4 years old.
        """
        # ... (same validation logic as before) ...
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        date_of_birth = data.get('date_of_birth')

        queryset = Child.objects.filter(
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth
        )
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("A child with this first name, last name, and date of birth already exists.")

        if date_of_birth:
            today = date.today()
            age = relativedelta(today, date_of_birth)
            total_months = age.years * 12 + age.months
            if total_months < 4 or total_months >= 48:
                raise serializers.ValidationError("Child must be between 4 months and 4 years old.")
        
        return data

    def create(self, validated_data):
        parent_ids = validated_data.pop('parent_ids', [])
        child = Child.objects.create(**validated_data)
        if parent_ids:
            parents = User.objects.filter(id__in=parent_ids)
            child.parents.set(parents)
        return child

    def update(self, instance, validated_data):
        parent_ids = validated_data.pop('parent_ids', [])

        # The 'family' and 'assigned_babysitter' are handled by their 'source' argument
        # on the PrimaryKeyRelatedField, so we can just iterate through validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if parent_ids:
            parents = User.objects.filter(id__in=parent_ids)
            instance.parents.set(parents)

        return instance


class AttendanceSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.first_name', read_only=True)
    checked_in_by_name = serializers.CharField(source='checked_in_by.get_full_name', read_only=True)
    checked_out_by_name = serializers.CharField(source='checked_out_by.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['checked_in_by', 'checked_out_by']

class ChildActivitySerializer(serializers.ModelSerializer):
    logged_by_name = serializers.CharField(source='logged_by.get_full_name', read_only=True)
    # Add stable key for React lists
    key = serializers.SerializerMethodField(read_only=True)
    activity_type = serializers.CharField(max_length=50)

    def get_key(self, obj):
        return f"act-{obj.id}"

    class Meta:
        model = ChildActivity
        fields = '__all__'
        read_only_fields = ['logged_by']

class HealthEventSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    # Add stable key for React lists
    key = serializers.SerializerMethodField(read_only=True)
    event_type = serializers.CharField(max_length=50)

    def get_key(self, obj):
        return f"evt-{obj.id}"

    class Meta:
        model = HealthEvent
        fields = '__all__'
        read_only_fields = ['recorded_by']

class DailyReportSerializer(serializers.Serializer):
    child_id = serializers.IntegerField()
    child_name = serializers.CharField()
    date = serializers.DateField()
    activities = ChildActivitySerializer(many=True)
    health_events = HealthEventSerializer(many=True)

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['author']

class GallerySerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = Gallery
        fields = '__all__'
        read_only_fields = ['uploaded_by']

class StaffProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = StaffProfile
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    recipient_details = UserSerializer(source='recipient', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = '__all__'

class ChatUserSerializer(serializers.ModelSerializer):
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'profile_picture', 'unread_count', 'last_message']
    
    def get_unread_count(self, obj):
        request_user = self.context['request'].user
        return ChatMessage.objects.filter(sender=obj, recipient=request_user, is_read=False).count()
    
    def get_last_message(self, obj):
        request_user = self.context['request'].user
        last_message = ChatMessage.objects.filter(
            Q(sender=obj, recipient=request_user) |
            Q(sender=request_user, recipient=obj)
        ).order_by('-timestamp').first()
        
        if last_message:
            return {
                'message': last_message.message[:50] + '...' if len(last_message.message) > 50 else last_message.message,
                'timestamp': last_message.timestamp,
                'sender_id': last_message.sender.id,
                'is_read': last_message.is_read
            }
        return None