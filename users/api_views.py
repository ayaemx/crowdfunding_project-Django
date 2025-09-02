from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.db import models
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileEditSerializer, UserSerializer
from projects.models import Project, Donation
from rest_framework.authtoken.models import Token


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
            print(f"Profile retrieval error: {e}")
            return Response(
                {'error': 'Failed to retrieve profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_projects(request):
    """Get user's projects - ENHANCED with proper serialization"""
    try:
        projects = Project.objects.filter(owner=request.user).annotate(
            total_donations=models.Sum('donations__amount'),
            average_rating=models.Avg('ratings__rating'),
            donations_count=models.Count('donations')
        ).select_related('category').prefetch_related('tags', 'pictures')

        projects_data = []
        for project in projects:
            # Get main picture
            main_picture = project.pictures.filter(is_main=True).first()
            if not main_picture:
                main_picture = project.pictures.first()

            projects_data.append({
                'id': project.id,
                'title': project.title,
                'details': project.details,
                'total_target': float(project.total_target),
                'total_donations': float(project.total_donations or 0),
                'average_rating': float(project.average_rating or 0),
                'donations_count': project.donations_count or 0,
                'created_at': project.created_at.isoformat(),
                'start_time': project.start_time.isoformat() if project.start_time else None,
                'end_time': project.end_time.isoformat() if project.end_time else None,
                'is_featured': project.is_featured,
                'is_active': project.is_active,
                'category': {
                    'id': project.category.id,
                    'name': project.category.name,
                    'slug': project.category.slug
                } if project.category else None,
                'tags': [{'id': tag.id, 'name': tag.name} for tag in project.tags.all()],
                'pictures': [{
                    'id': pic.id,
                    'image': request.build_absolute_uri(pic.image.url) if pic.image else None,
                    'is_main': pic.is_main,
                    'order': pic.order
                } for pic in project.pictures.all()],
                'user': {
                    'id': project.owner.id,
                    'first_name': project.owner.first_name,
                    'last_name': project.owner.last_name,
                }
            })

        return Response(projects_data)
    except Exception as e:
        print(f"Projects error: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_donations(request):
    """Get user's donations - ENHANCED with project details"""
    try:
        donations = Donation.objects.filter(donor=request.user).select_related('project')

        donations_data = []
        for donation in donations:
            donations_data.append({
                'id': donation.id,
                'amount': float(donation.amount),
                'donation_date': donation.donation_date.isoformat(),
                'project_title': donation.project.title,
                'project_id': donation.project.id,
                'project': {
                    'id': donation.project.id,
                    'title': donation.project.title,
                    'total_target': float(donation.project.total_target),
                    'is_active': donation.project.is_active,
                }
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

        # FIXED: Create token for new user
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """User login with detailed error handling - FIXED"""
    print(f"Login request data: {request.data}")

    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': 'Email and password are required.'
        }, status=400)

    print(f"Login attempt - Email: {email}")

    # Check if user exists
    try:
        user_obj = User.objects.get(email=email)
        print(f"User found - Active: {user_obj.is_active}, Email: {user_obj.email}")

        if not user_obj.is_active:
            return Response({
                'error': 'Account not activated. Please check your email for activation link.'
            }, status=400)

    except User.DoesNotExist:
        print(f"User not found with email: {email}")
        return Response({
            'error': 'No account found with this email address.'
        }, status=400)

    # Attempt authentication
    user = authenticate(request, email=email, password=password)
    print(f"Authentication result: {user}")

    if user:
        if user.is_active:
            # FIXED: Create or get token
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
        print(f"Authentication failed for email: {email}")
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
