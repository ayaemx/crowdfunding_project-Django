# users/urls.py - FIXED VERSION
from django.urls import path, reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views

# Import template views
from .views import (
    UserRegisterView, UserProfileEditView, ActivateAccountView,
    email_login_view, UserDeleteView, UserProfileView
)

# Import API views - *** FIXED: Missing imports ***
from .api_views import (
    UserListAPI, UserRegistrationAPI, UserProfileAPI, UserLoginAPI,
    logout_api, UserProjectsAPI, UserDonationsAPI, user_stats_api
)

app_name = 'users'

urlpatterns = [
    # ===== TEMPLATE VIEWS (for testing) =====
    path('register/', UserRegisterView.as_view(), name='register'),
    path('register/done/', TemplateView.as_view(template_name='users/register_done.html'), name='register_done'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/edit/', UserProfileEditView.as_view(), name='profile-edit'),
    path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),
    path('login/', email_login_view, name='login'),
    path('delete/', UserDeleteView.as_view(), name='delete-account'),

    # ===== API ENDPOINTS (for React) =====
    path('api/users/', UserListAPI.as_view(), name='api-user-list'),  # GET /users/api/users/
    path('api/register/', UserRegistrationAPI.as_view(), name='api-user-register'),  # POST /users/api/register/
    path('api/login/', UserLoginAPI.as_view(), name='api-login'),  # POST /users/api/login/
    path('api/logout/', logout_api, name='api-logout'),  # POST /users/api/logout/
    path('api/profile/', UserProfileAPI.as_view(), name='api-user-profile'),  # GET/PUT /users/api/profile/
    path('api/my-projects/', UserProjectsAPI.as_view(), name='api-user-projects'),  # GET /users/api/my-projects/
    path('api/my-donations/', UserDonationsAPI.as_view(), name='api-user-donations'),  # GET /users/api/my-donations/
    path('api/stats/', user_stats_api, name='api-user-stats'),  # GET /users/api/stats/

    # ===== PASSWORD RESET SYSTEM =====
    path('password-reset/', auth_views.PasswordResetView.as_view(
        template_name='users/password_reset.html',
        email_template_name='users/password_reset_email.html',
        success_url=reverse_lazy('users:password_reset_done')
    ), name='password_reset'),

    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(
        template_name='users/password_reset_done.html'
    ), name='password_reset_done'),

    path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='users/password_reset_confirm.html'
    ), name='password_reset_confirm'),

    path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(
        template_name='users/password_reset_complete.html'
    ), name='password_reset_complete'),
]
