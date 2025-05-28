from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class ProjectPicture(models.Model):
    image = models.ImageField(upload_to='project_pictures/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Picture {self.id}"

class Project(models.Model):
    title = models.CharField(max_length=200)
    details = models.TextField()
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, null=True, blank=True)
    pictures = models.ManyToManyField(ProjectPicture, blank=True)
    total_target = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=[('USD', 'USD'), ('EGP', 'EGP')], default='USD')
    tags = models.ManyToManyField('tags.Tag', blank=True)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    average_rating = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def get_currency(self):
        return self.currency
