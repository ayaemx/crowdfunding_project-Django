# users/api_views.py - ENHANCED VERSION WITH BETTER ERROR HANDLING
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    UserProfileEditSerializer, UserLoginSerializer,
    UserProjectsSerializer, UserDonationsSerializer
)

class UserListAPI(generics.ListAPIView):
    """List all users (admin only, or restrict as needed)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserRegistrationAPI(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileAPI(generics.RetrieveUpdateAPIView):
    """View or edit the current user's profile."""
    serializer_class = UserProfileEditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginAPI(generics.GenericAPIView):
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
                user = authenticate(username=user.username, password=password)

                if user and user.is_active:
                    token, created = Token.objects.get_or_create(user=user)
                    return Response({
                        'token': token.key,
                        'user': UserSerializer(user, context={'request': request}).data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'error': 'Invalid credentials or inactive account'
                    }, status=status.HTTP_401_UNAUTHORIZED)

            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    """FIXED: Get user's created projects with proper queryset"""
    serializer_class = UserProjectsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # *** FIXED: Use the proper relationship ***
        return self.request.user.projects.all().order_by('-created_at')

class UserDonationsAPI(generics.ListAPIView):
    """FIXED: Get user's donation history with proper queryset"""
    serializer_class = UserDonationsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # *** FIXED: Use the proper relationship ***
        return self.request.user.donations.all().order_by('-donation_date')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats_api(request):
    """Get user statistics with real calculated data"""
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
