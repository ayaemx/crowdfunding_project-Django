# comments/serializers.py - CLEANED VERSION
from rest_framework import serializers
from .models import Comment, CommentReport


class CommentSerializer(serializers.ModelSerializer):
    """FIXED: Clean user display with only full name"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    # *** REMOVED: username field to avoid confusion ***
    replies_count = serializers.SerializerMethodField()
    is_reply = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'created_at', 'user', 'user_name',  # *** REMOVED: 'username' ***
            'parent', 'replies_count', 'is_reply'
        ]
        read_only_fields = ['user', 'created_at']

    def get_replies_count(self, obj):
        return obj.replies.count()

    def get_is_reply(self, obj):
        return obj.parent is not None


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""

    class Meta:
        model = Comment
        fields = ['content', 'parent']


class CommentReportSerializer(serializers.ModelSerializer):
    """Serializer for reporting comments"""

    class Meta:
        model = CommentReport
        fields = ['reason', 'details']
