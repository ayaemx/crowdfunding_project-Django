from django import forms
from .models import User
import re
from django.contrib.auth.password_validation import validate_password

class DateInput(forms.DateInput):
    input_type = 'date'

# Registration form (only required fields)
class UserRegistrationForm(forms.ModelForm):
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput,
        help_text="Password must be at least 8 characters."
    )
    password2 = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput,
        help_text="Enter the same password again."
    )
    mobile_phone = forms.CharField(
        label='Mobile Phone',
        help_text="Enter a valid Egyptian phone number (e.g., 01XXXXXXXXX).",
        max_length=15
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'mobile_phone', 'profile_picture'
        ]

    def clean_mobile_phone(self):
        phone = self.cleaned_data['mobile_phone']
        if not re.match(r'^01[0125][0-9]{8}$', phone):
            raise forms.ValidationError("Enter a valid Egyptian phone number (e.g., 01XXXXXXXXX).")
        return phone

    def clean_password1(self):
        password1 = self.cleaned_data.get('password1')
        validate_password(password1)
        return password1

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            self.add_error('password2', "Passwords do not match.")

# Profile edit form (optional fields + required, except email)
class UserProfileEditForm(forms.ModelForm):
    birthdate = forms.DateField(widget=DateInput(), required=False)
    facebook_profile = forms.URLField(required=False)
    country = forms.CharField(required=False)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'mobile_phone', 'profile_picture',
            'birthdate', 'facebook_profile', 'country'
        ]
class EmailLoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)

class UserDeleteForm(forms.Form):
    password = forms.CharField(
        label="Confirm your password",
        widget=forms.PasswordInput,
        help_text="Enter your password to confirm account deletion."
    )

# users/views.py or users/forms.py
def send_activation_email(self, request, user):
    current_site = get_current_site(request)
    subject = 'Activate Your Account'
    message = render_to_string('users/activate_account.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': token_generator.make_token(user),
    })
    user.email_user(subject, message, html_message=message)
