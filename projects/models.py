from django.db import models
from django.conf import settings

class ProjectPicture(models.Model):
    image = models.ImageField(upload_to='project_pictures/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Picture {self.id}"

class Project(models.Model):
    USD = 'USD'
    EUR = 'EUR'
    EGP = 'EGP'
    CURRENCY_CHOICES = [
        (USD, 'USD'),
        (EUR, 'EUR'),
        (EGP, 'EGP'),
    ]

    title = models.CharField(max_length=200)
    details = models.TextField()
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    pictures = models.ManyToManyField(ProjectPicture, blank=True, related_name='projects')
    total_target = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=EGP)
    tags = models.ManyToManyField('tags.Tag', blank=True, related_name='projects')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title