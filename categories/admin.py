# categories/admin.py - ENHANCED VERSION (ONLY AFTER MODEL UPDATE)
from django.contrib import admin
from django.db.models import Count
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Enhanced admin for categories"""
    list_display = ['name', 'description', 'slug', 'projects_count', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'projects_count']
    list_editable = ['is_active', 'order']  # *** NOW 'order' exists in model ***
    ordering = ['order', 'name']

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            projects_count=Count('projects')
        )

    def projects_count(self, obj):
        return obj.projects_count if hasattr(obj, 'projects_count') else 0

    projects_count.short_description = 'Projects Count'
