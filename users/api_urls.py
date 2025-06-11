from django.urls import path
from .api_views import (
    UserListAPI, UserRegistrationAPI, UserProfileAPI, UserLoginAPI,
    logout_api, UserProjectsAPI, UserDonationsAPI, user_stats_api
)
# API endpoints only (no app_name needed for APIs)
urlpatterns = [
    # Authentication endpoints
    path('login/', UserLoginAPI.as_view(), name='api-login'),  # /api/auth/login/
    path('logout/', logout_api, name='api-logout'),  # /api/auth/logout/
    path('register/', UserRegistrationAPI.as_view(), name='api-register'),  # /api/auth/register/

    # User data endpoints
    path('profile/', UserProfileAPI.as_view(), name='api-profile'),  # /api/auth/profile/
    path('users/', UserListAPI.as_view(), name='api-users'),  # /api/auth/users/
    path('stats/', user_stats_api, name='api-stats'),  # /api/auth/stats/

    # User content endpoints
    path('my-projects/', UserProjectsAPI.as_view(), name='api-user-projects'),  # /api/auth/my-projects/
    path('my-donations/', UserDonationsAPI.as_view(), name='api-user-donations'),  # /api/auth/my-donations/
]
