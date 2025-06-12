from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings
from .models import User
from .tokens import account_activation_token
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    UserProfileEditSerializer, UserLoginSerializer,
    UserProjectsSerializer, UserDonationsSerializer
)


class UserListAPI(generics.ListAPIView):
    """List all users (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserRegistrationAPI(generics.CreateAPIView):
    """Enhanced registration API with email activation"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Send activation email
            self.send_activation_email(request, user)

            return Response({
                'message': 'Registration successful! Please check your email for activation link.',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_activation_email(self, request, user):
        """Send activation email to user"""
        current_site = get_current_site(request)
        token = account_activation_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        activation_link = f"http://{current_site.domain}/api/auth/activate/{uid}/{token}/"

        subject = 'Activate Your Egyptian Crowdfunding Account'
        message = f"""
Dear {user.first_name} {user.last_name},

Welcome to Egyptian Crowdfunding Platform!

Please click the link below to activate your account:
{activation_link}

This link will expire in 24 hours.

Best regards,
Egyptian Crowdfunding Team
"""

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send activation email: {e}")


@method_decorator(csrf_exempt, name='dispatch')
class UserLoginAPI(generics.GenericAPIView):
    """Enhanced login API with better error handling"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                user = User.objects.get(email=email)

                if not user.is_active:
                    return Response({
                        'error': 'Account not activated. Please check your email for activation link.'
                    }, status=status.HTTP_401_UNAUTHORIZED)

                user = authenticate(username=user.username, password=password)
                if user:
                    token, created = Token.objects.get_or_create(user=user)
                    return Response({
                        'token': token.key,
                        'user': UserSerializer(user, context={'request': request}).data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'error': 'Invalid credentials'
                    }, status=status.HTTP_401_UNAUTHORIZED)

            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def activate_account_api(request, uidb64, token):
    """API endpoint for account activation"""
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({
            'message': 'Account activated successfully! You can now login.'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid or expired activation link.'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileAPI(generics.RetrieveUpdateAPIView):
    """View or edit the current user's profile"""
    serializer_class = UserProfileEditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_api(request):
    """API Logout - delete token"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'},
                        status=status.HTTP_400_BAD_REQUEST)


class UserProjectsAPI(generics.ListAPIView):
    """Get user's created projects"""
    serializer_class = UserProjectsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.projects.all().order_by('-created_at')


class UserDonationsAPI(generics.ListAPIView):
    """Get user's donation history"""
    serializer_class = UserDonationsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.donations.all().order_by('-donation_date')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats_api(request):
    """Get user statistics"""
    user = request.user
    return Response({
        'projects_count': user.projects_count,
        'donations_count': user.donations_count,
        'total_donated': user.total_donated,
        'member_since': user.date_joined,
        'profile_completion': calculate_profile_completion(user)
    })


def calculate_profile_completion(user):
    """Calculate profile completion percentage"""
    fields = ['first_name', 'last_name', 'email', 'mobile_phone',
              'profile_picture', 'birthdate', 'facebook_profile', 'country']
    completed = sum(1 for field in fields if getattr(user, field))
    return round((completed / len(fields)) * 100)
