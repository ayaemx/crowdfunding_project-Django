from rest_framework import generics, permissions
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileEditSerializer

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
