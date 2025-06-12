# tags/serializers.py - FIXED VERSION
from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    """FIXED: Serializer for tag data with annotated project count"""
    projects_count = serializers.IntegerField(read_only=True)  # *** FIXED: From annotation, not property ***
    is_popular = serializers.BooleanField(read_only=True)  # *** FIXED: From annotation, not property ***

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description', 'projects_count', 'is_popular', 'created_at']
        read_only_fields = ['slug', 'created_at']


class TagCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tags"""

    class Meta:
        model = Tag
        fields = ['name', 'description']

    def validate_name(self, value):
        """Ensure tag name is properly formatted"""
        cleaned_name = value.strip().lower()
        if len(cleaned_name) < 2:
            raise serializers.ValidationError("Tag name must be at least 2 characters long")
        return cleaned_name


class PopularTagsSerializer(serializers.ModelSerializer):
    """Lightweight serializer for popular tags display"""
    projects_count = serializers.IntegerField(read_only=True)  # *** FIXED: From annotation ***

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'projects_count']
