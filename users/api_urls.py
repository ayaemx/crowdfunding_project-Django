from django.urls import path
from . import api_views

urlpatterns = [
    # Authentication endpoints
    path('login/', api_views.login_user, name='api-login'),
    path('logout/', api_views.logout_api, name='api-logout'),
    path('register/', api_views.register_user, name='api-register'),

    # User data endpoints
    path('profile/', api_views.UserProfileAPI.as_view(), name='api-profile'),

    # User content endpoints - FIXED endpoint names
    path('my-projects/', api_views.get_my_projects, name='api-user-projects'),
    path('my-donations/', api_views.get_my_donations, name='api-user-donations'),
]
