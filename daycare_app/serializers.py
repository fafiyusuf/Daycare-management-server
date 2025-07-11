from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *
from django.db.models import Q

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active_staff', 'profile_picture', 'bio', 'password'] # Added 'password'
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}, # 'required': False allows updates without changing password
            'is_active_staff': {'required': False},
            'profile_picture': {'required': False, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True}
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
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None:
            instance.set_password(password) # Use set_password for hashing new password
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password) # Pass request for proper authentication backend
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
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        # Use create_user for proper password hashing
        user = User.objects.create_user(**validated_data)
        user.set_password(password) # set_password handles hashing
        user.save()
        return user

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = '__all__'

class ChildSerializer(serializers.ModelSerializer):
    parents_details = UserSerializer(source='parents', many=True, read_only=True)
    assigned_babysitter_details = UserSerializer(source='assigned_babysitter', read_only=True)
    
    class Meta:
        model = Child
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    child_details = ChildSerializer(source='child', read_only=True)
    checked_in_by_details = UserSerializer(source='checked_in_by', read_only=True)
    checked_out_by_details = UserSerializer(source='checked_out_by', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'

class ChildActivitySerializer(serializers.ModelSerializer):
    child_details = ChildSerializer(source='child', read_only=True)
    logged_by_details = UserSerializer(source='logged_by', read_only=True)
    
    class Meta:
        model = ChildActivity
        fields = '__all__'

class HealthEventSerializer(serializers.ModelSerializer):
    child_details = ChildSerializer(source='child', read_only=True)
    recorded_by_details = UserSerializer(source='recorded_by', read_only=True)
    
    class Meta:
        model = HealthEvent
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['author'] 

class GallerySerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    
    class Meta:
        model = Gallery
        fields = '__all__'

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
                'sender': last_message.sender.username
            }
        return None