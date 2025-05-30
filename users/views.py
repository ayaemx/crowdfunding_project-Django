from django.urls import reverse_lazy, reverse
from django.views.generic.edit import CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import UserRegistrationForm, UserProfileEditForm, EmailLoginForm, UserDeleteForm
from .models import User
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from .tokens import account_activation_token
from django.views import View
from django.shortcuts import render, redirect, resolve_url
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib import messages
from django.views.generic import TemplateView

# Registration
class UserRegisterView(CreateView):
    model = User
    form_class = UserRegistrationForm
    template_name = 'users/register.html'
    success_url = reverse_lazy('users:register_done')

    def form_valid(self, form):
        user = form.save(commit=False)
        user.set_password(form.cleaned_data['password1'])
        user.is_active = False  # For activation step

        # Auto-generate a unique username from email
        email = form.cleaned_data['email']
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        user.username = username

        user.save()

        # Send activation email
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activation_link = self.request.build_absolute_uri(
            reverse('users:activate', kwargs={'uidb64': uid, 'token': token})
        )
        subject = 'Activate your account'
        message = (
            f'Hi {user.first_name},\n\n'
            f'Please activate your account by clicking the link below:\n{activation_link}\n\n'
            f'This link will expire in 24 hours.'
        )
        send_mail(subject, message, None, [user.email])

        return super().form_valid(form)

# Profile Edit
class UserProfileEditView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = UserProfileEditForm
    template_name = 'users/profile_edit.html'
    success_url = reverse_lazy('users:profile')

    def get_object(self):
        return self.request.user

# Activation View
UserModel = get_user_model()

class ActivateAccountView(View):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = UserModel.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            messages.success(request, "Your account has been activated! You can now log in.")
            return redirect('users:login')
        else:
            return render(request, 'users/activation_invalid.html')

# Login View (Email-based)
def email_login_view(request):
    form = EmailLoginForm(request.POST or None)
    next_url = request.GET.get('next') or request.POST.get('next') or resolve_url('home')
    if request.method == "POST":
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = None
            if user:
                user = authenticate(request, username=user.username, password=password)
                if user is not None:
                    login(request, user)
                    return redirect(next_url)
            messages.error(request, "Invalid email or password.")
    return render(request, "users/login.html", {"form": form, "next": next_url})

# Profile View
class UserProfileView(LoginRequiredMixin, TemplateView):
    template_name = 'users/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        context['user_obj'] = user
        # Projects and donations can be added here later
        return context

# Account Deletion View
class UserDeleteView(LoginRequiredMixin, View):
    template_name = 'users/delete_account_confirm.html'

    def get(self, request):
        form = UserDeleteForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = UserDeleteForm(request.POST)
        if form.is_valid():
            password = form.cleaned_data['password']
            user = request.user
            if authenticate(username=user.username, password=password):
                user.delete()
                logout(request)
                messages.success(request, "Your account has been deleted.")
                return redirect('home')
            else:
                messages.error(request, "Incorrect password. Account not deleted.")
        return render(request, self.template_name, {'form': form})
