# tags/admin.py - ENHANCED ADMIN INTERFACE
from django.contrib import admin
from .models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Enhanced admin for tags with project counts"""
    list_display = ['name', 'slug', 'projects_count', 'is_popular', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['slug', 'projects_count', 'is_popular', 'created_at']
    prepopulated_fields = {'slug': ('name',)}

    fieldsets = [
        ('Tag Information', {
            'fields': ['name', 'slug', 'description']
        }),
        ('Statistics', {
            'fields': ['projects_count', 'is_popular', 'created_at'],
            'classes': ['collapse']
        }),
    ]

    def get_queryset(self, request):
        """Add projects count to admin queryset"""
        from django.db.models import Count
        return super().get_queryset(request).annotate(
            projects_count=Count('projects')
        )

    def projects_count(self, obj):
        """Display projects count in admin"""
        return obj.projects_count

    projects_count.short_description = 'Projects Count'
    projects_count.admin_order_field = 'projects_count'

    def is_popular(self, obj):
        """Display if tag is popular"""
        return obj.projects_count >= 5

    is_popular.boolean = True
    is_popular.short_description = 'Popular (5+ projects)'
