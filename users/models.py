from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.urls import reverse


class User(AbstractUser):
    # Egyptian phone validator (PDF requirement [1])
    egyptian_phone_validator = RegexValidator(
        regex=r'^01[0125][0-9]{8}$',
        message="Enter a valid Egyptian phone number (e.g., 01XXXXXXXXX)."
    )

    # FIXED: Changed from mobile_phone to phone_number to match serializer
    phone_number = models.CharField(
        max_length=15,
        unique=True,
        validators=[egyptian_phone_validator],
        help_text="Egyptian phone number format: 01XXXXXXXXX",
        blank=True,
        null=True
    )

    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        blank=True,
        null=True,
        help_text="Upload your profile picture"
    )

    birthdate = models.DateField(blank=True, null=True)
    facebook_profile = models.URLField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)

    # Additional fields for better user management
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # FIXED: Set email as username field for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_absolute_url(self):
        return reverse('users:profile')

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def user_projects(self):
        """Get all projects created by this user"""
        return self.projects.all().order_by('-created_at')

    @property
    def user_donations(self):
        """Get all donations made by this user"""
        return self.donations.all().order_by('-donation_date')

    @property
    def total_donated(self):
        """Calculate total amount donated by user"""
        from django.db.models import Sum
        total = self.donations.aggregate(total=Sum('amount'))['total']
        return total or 0

    @property
    def projects_count(self):
        """Count of projects created by user"""
        return self.projects.count()

    @property
    def donations_count(self):
        """Count of donations made by user"""
        return self.donations.count()

    class Meta:
        db_table = 'users_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
