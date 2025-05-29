from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
import re

class UserSerializer(serializers.ModelSerializer):
    """For listing and viewing user profiles."""
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'mobile_phone', 'profile_picture', 'birthdate',
            'facebook_profile', 'country', 'is_active'
        ]
        read_only_fields = ['id', 'email', 'is_active']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """For registering new users via API."""
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
