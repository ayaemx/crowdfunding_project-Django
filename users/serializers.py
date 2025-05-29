from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'mobile_phone', 'profile_picture', 'birthdate',
            'facebook_profile', 'country', 'is_active'
        ]
        read_only_fields = ['id', 'is_active', 'email']
