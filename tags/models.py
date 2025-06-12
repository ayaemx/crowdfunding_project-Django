# tags/models.py - FIXED VERSION
from django.db import models
from django.utils.text import slugify


class Tag(models.Model):
    """System-wide tags for projects"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        """Auto-generate slug from name"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    # *** REMOVED: projects_count property to avoid conflict ***
    # *** REMOVED: is_popular property to avoid conflict ***

    def __str__(self):
        return self.name
