from django.urls import path
from .api_views import (
    UserListAPI, UserRegistrationAPI, UserProfileAPI, UserLoginAPI,
    logout_api, UserProjectsAPI, UserDonationsAPI, user_stats_api,
    activate_account_api  # Add this import
)

urlpatterns = [
    # Authentication endpoints
    path('login/', UserLoginAPI.as_view(), name='api-login'),
    path('logout/', logout_api, name='api-logout'),
    path('register/', UserRegistrationAPI.as_view(), name='api-register'),
    path('activate/<str:uidb64>/<str:token>/', activate_account_api, name='api-activate'),  # Add this line

    # User data endpoints
    path('profile/', UserProfileAPI.as_view(), name='api-profile'),
    path('users/', UserListAPI.as_view(), name='api-users'),
    path('stats/', user_stats_api, name='api-stats'),

    # User content endpoints
    path('my-projects/', UserProjectsAPI.as_view(), name='api-user-projects'),
    path('my-donations/', UserDonationsAPI.as_view(), name='api-user-donations'),
]
