from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    mobile_phone = models.CharField(max_length=15, unique=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    facebook_profile = models.URLField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    def __str__(self):
        return self.username
