from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User
import re




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'profile_picture', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Enhanced registration serializer matching React form fields"""
    password1 = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'mobile_phone',
                  'password1', 'password2', 'profile_picture']
        extra_kwargs = {
            'profile_picture': {'required': False}
        }

    def validate_mobile_phone(self, value):
        """Validate Egyptian phone number format"""
        if not re.match(r'^01[0125][0-9]{8}$', value):
            raise serializers.ValidationError(
                "Enter a valid Egyptian phone number (e.g., 01XXXXXXXXX)."
            )
        return value

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({
                'password2': "Passwords do not match."
            })

        # Validate password strength
        try:
            validate_password(attrs['password1'])
        except Exception as e:
            raise serializers.ValidationError({
                'password1': list(e.messages)
            })

        return attrs

    def create(self, validated_data):
        """Create user with proper password handling"""
        # Remove password2 as it's not needed for user creation
        validated_data.pop('password2')
        password = validated_data.pop('password1')

        # Auto-generate username from email
        email = validated_data['email']
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        # Create inactive user (requires email activation)
        user = User.objects.create_user(
            username=username,
            password=password,
            is_active=False,  # Require email activation
            **validated_data
        )

        return user




class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError('No account found with this email address.')

            # Check if user is active
            if not user.is_active:
                raise serializers.ValidationError('Account not activated.')

            # Authenticate user
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')


class UserProfileEditSerializer(serializers.ModelSerializer):
    """Serializer for profile editing (excluding email)"""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'mobile_phone', 'profile_picture',
                  'birthdate', 'facebook_profile', 'country']

    def validate_mobile_phone(self, value):
        """Validate Egyptian phone number format"""
        if value and not re.match(r'^01[0125][0-9]{8}$', value):
            raise serializers.ValidationError(
                "Enter a valid Egyptian phone number (e.g., 01XXXXXXXXX)."
            )
        return value

    def validate_facebook_profile(self, value):
        """Validate Facebook profile URL"""
        if value and value.strip():
            if not (value.startswith('http://') or value.startswith('https://')):
                return f"https://{value}"
        return value


# FIXED: Move these serializers to avoid circular imports
class UserProjectsSerializer(serializers.Serializer):
    """Serializer for user's projects - using Serializer to avoid circular import"""
    id = serializers.IntegerField()
    title = serializers.CharField()
    details = serializers.CharField()
    total_target = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_donations = serializers.DecimalField(max_digits=10, decimal_places=2)
    created_at = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    is_featured = serializers.BooleanField()


class UserDonationsSerializer(serializers.Serializer):
    """Serializer for user's donations - using Serializer to avoid circular import"""
    id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    donation_date = serializers.DateTimeField()
    project_title = serializers.CharField()
