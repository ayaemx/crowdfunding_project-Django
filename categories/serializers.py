# categories/serializers.py - ENHANCED VERSION
from rest_framework import serializers
from django.db.models import Count
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Enhanced category serializer with project count"""
    projects_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'slug', 'created_at', 'projects_count']
        read_only_fields = ['slug', 'created_at']

    def get_projects_count(self, obj):
        """Get count of active projects in this category"""
        if hasattr(obj, 'projects_count'):
            return obj.projects_count
        return obj.projects.filter(is_active=True).count()


class CategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating categories"""

    class Meta:
        model = Category
        fields = ['name', 'description']

    def validate_name(self, value):
        """Ensure category name is properly formatted"""
        cleaned_name = value.strip().title()  # Capitalize properly
        if len(cleaned_name) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long")
        return cleaned_name


class CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for category lists"""
    projects_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'projects_count']


class CategoryWithProjectsSerializer(serializers.ModelSerializer):
    """Category with project details for homepage"""
    projects_count = serializers.IntegerField(read_only=True)
    recent_projects = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'projects_count', 'recent_projects']

    def get_recent_projects(self, obj):
        """Get 3 most recent projects in this category"""
        recent_projects = obj.projects.filter(is_active=True).order_by('-created_at')[:3]
        # Import here to avoid circular imports
        from projects.serializers import ProjectListSerializer
        return ProjectListSerializer(recent_projects, many=True, context=self.context).data
