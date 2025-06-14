from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.db import models
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileEditSerializer, UserSerializer
from projects.models import Project, Donation


class UserProfileAPI(generics.RetrieveUpdateAPIView):
    """Get and update user profile - FIXED"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to handle errors gracefully"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            print(f"Profile retrieval error: {e}")  # Debug logging
            return Response(
                {'error': 'Failed to retrieve profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_projects(request):
    """Get user's projects"""
    try:
        projects = Project.objects.filter(owner=request.user).annotate(
            total_donations=models.Sum('donations__amount'),
            average_rating=models.Avg('ratings__rating'),
            donations_count=models.Count('donations')
        )

        projects_data = []
        for project in projects:
            projects_data.append({
                'id': project.id,
                'title': project.title,
                'details': project.details,
                'total_target': float(project.total_target),
                'total_donations': float(project.total_donations or 0),
                'average_rating': float(project.average_rating or 0),
                'donations_count': project.donations_count or 0,
                'created_at': project.created_at.isoformat(),
                'end_time': project.end_time.isoformat(),
                'is_featured': project.is_featured,
                'is_active': project.is_active,
            })

        return Response(projects_data)
    except Exception as e:
        print(f"Projects error: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_donations(request):
    """Get user's donations - FIXED to use 'donor' field"""
    try:
        # FIXED: Use 'donor' field instead of 'user' based on your Donation model
        donations = Donation.objects.filter(donor=request.user).select_related('project')

        donations_data = []
        for donation in donations:
            donations_data.append({
                'id': donation.id,
                'amount': float(donation.amount),
                'donation_date': donation.donation_date.isoformat(),
                'project_title': donation.project.title,
                'project_id': donation.project.id,
            })

        return Response(donations_data)
    except Exception as e:
        print(f"Donations error: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """User registration"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully. Please check your email for activation.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """User login with detailed error handling - FIXED"""
    print(f"Login request data: {request.data}")  # Debug logging

    # FIXED: Simplified validation - just check if email and password exist
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': 'Email and password are required.'
        }, status=400)

    print(f"Login attempt - Email: {email}")  # Debug logging

    # Check if user exists
    try:
        user_obj = User.objects.get(email=email)
        print(f"User found - Active: {user_obj.is_active}, Email: {user_obj.email}")  # Debug logging

        if not user_obj.is_active:
            return Response({
                'error': 'Account not activated. Please check your email for activation link.'
            }, status=400)

    except User.DoesNotExist:
        print(f"User not found with email: {email}")  # Debug logging
        return Response({
            'error': 'No account found with this email address.'
        }, status=400)

    # Attempt authentication - FIXED: Use request parameter
    user = authenticate(request, email=email, password=password)
    print(f"Authentication result: {user}")  # Debug logging

    if user:
        if user.is_active:
            # Create or get token
            from rest_framework.authtoken.models import Token
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                }
            })
        else:
            return Response({
                'error': 'Account not activated. Please check your email for activation link.'
            }, status=400)
    else:
        print(f"Authentication failed for email: {email}")  # Debug logging
        return Response({
            'error': 'Invalid email or password. Please check your credentials.'
        }, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """API Logout - delete token"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)
