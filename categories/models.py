# categories/models.py - ENHANCED VERSION
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """Enhanced category model"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # *** NEW: Additional fields for better management ***
    is_active = models.BooleanField(default=True)  # For hiding categories
    order = models.PositiveIntegerField(default=0)  # For custom ordering

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def active_projects_count(self):
        """Count of active projects in this category"""
        return self.projects.filter(is_active=True).count()

    def __str__(self):
        return self.name
