from .views import UserRegisterView, UserProfileEditView, ActivateAccountView, email_login_view, UserDeleteView, UserProfileView
from django.views.generic import TemplateView
from .api_views import UserListAPI, UserRegistrationAPI, UserProfileAPI
from django.contrib.auth import views as auth_views
from django.urls import path
from django.urls import reverse_lazy

app_name = 'users'

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    path('register/done/', TemplateView.as_view(template_name='users/register_done.html'), name='register_done'),
    path('profile/edit/', UserProfileEditView.as_view(), name='profile-edit'),
    path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),
    path('login/', email_login_view, name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('delete/', UserDeleteView.as_view(), name='delete-account'),
    path('api/users/', UserListAPI.as_view(), name='api-user-list'),
    path('api/register/', UserRegistrationAPI.as_view(), name='api-user-register'),
    path('api/profile/', UserProfileAPI.as_view(), name='api-user-profile'),

    # Password reset URLs with custom email template
    path(
        'password-reset/',
        auth_views.PasswordResetView.as_view(
            template_name='users/password_reset.html',
            email_template_name='users/password_reset_email.html',
            success_url=reverse_lazy('users:password_reset_done')  # <--- Add this line
        ),
        name='password_reset'
    ),
    path(
        'password-reset/done/',
        auth_views.PasswordResetDoneView.as_view(template_name='users/password_reset_done.html'),
        name='password_reset_done'
    ),
    path(
        'password-reset-confirm/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(template_name='users/password_reset_confirm.html'),
        name='password_reset_confirm'
    ),
    path(
        'password-reset-complete/',
        auth_views.PasswordResetCompleteView.as_view(template_name='users/password_reset_complete.html'),
        name='password_reset_complete'
    ),
]
