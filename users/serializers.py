# users/serializers.py - COMPLETE FIXED VERSION
from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
import re

# *** FIXED: Import actual models instead of string references ***
from projects.models import Project, Donation

class UserSerializer(serializers.ModelSerializer):
    """Enhanced user data for API"""
    full_name = serializers.ReadOnlyField()
    projects_count = serializers.ReadOnlyField()
    donations_count = serializers.ReadOnlyField()
    total_donated = serializers.ReadOnlyField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'mobile_phone', 'profile_picture_url', 'birthdate',
            'facebook_profile', 'country', 'projects_count',
            'donations_count', 'total_donated', 'date_joined'
        ]

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return self.context['request'].build_absolute_uri(obj.profile_picture.url)
        return None

class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'mobile_phone',
            'profile_picture', 'password1', 'password2'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'mobile_phone': {'required': True},
        }

    def validate_mobile_phone(self, value):
        if not re.match(r'^01[0125][0-9]{8}$', value):
            raise serializers.ValidationError("Enter a valid Egyptian phone number (e.g., 01XXXXXXXXX).")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password1(self, value):
        validate_password(value)
        return value

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')
        email = validated_data['email']

        # Auto-generate unique username
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(**validated_data)
        user.username = username
        user.set_password(password)
        user.is_active = False  # For activation
        user.save()
        return user

class UserProfileEditSerializer(serializers.ModelSerializer):
    """For editing user profile via API (except email)."""
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'mobile_phone', 'profile_picture',
            'birthdate', 'facebook_profile', 'country'
        ]

class UserLoginSerializer(serializers.Serializer):
    """For API login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

# *** FIXED: Use actual model classes instead of string references ***
class UserProjectsSerializer(serializers.ModelSerializer):
    """PERMANENT FIX: For user's projects list using actual Project model"""
    current_amount = serializers.ReadOnlyField()
    funding_percentage = serializers.ReadOnlyField()
    main_picture = serializers.SerializerMethodField()

    class Meta:
        model = Project  # *** FIXED: Direct model reference ***
        fields = [
            'id', 'title', 'total_target', 'current_amount',
            'funding_percentage', 'created_at', 'end_time', 'main_picture'
        ]

    def get_main_picture(self, obj):
        """Get first project picture"""
        if hasattr(obj, 'pictures') and obj.pictures.exists():
            picture = obj.pictures.first()
            if picture and picture.image:
                return self.context['request'].build_absolute_uri(picture.image.url)
        return None

class UserDonationsSerializer(serializers.ModelSerializer):
    """PERMANENT FIX: For user's donation history using actual Donation model"""
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_id = serializers.IntegerField(source='project.id', read_only=True)

    class Meta:
        model = Donation  # *** FIXED: Direct model reference ***
        fields = ['id', 'project_id', 'project_title', 'amount', 'donation_date']
