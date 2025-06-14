from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Comment, CommentReport

User = get_user_model()


class CommentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'profile_picture']
        read_only_fields = ['id', 'first_name', 'last_name', 'profile_picture']


class CommentReplySerializer(serializers.ModelSerializer):
    """Serializer for comment replies"""
    user = CommentUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'created_at', 'parent']
        read_only_fields = ['id', 'created_at', 'user']


class CommentSerializer(serializers.ModelSerializer):
    """Main comment serializer - FIXED to filter reported replies"""
    user = CommentUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'created_at', 'parent', 'replies']
        read_only_fields = ['id', 'created_at', 'user']

    def get_replies(self, obj):
        """Get replies for parent comments only - FILTER OUT REPORTED REPLIES"""
        if obj.parent is None:  # Only get replies for parent comments
            # CRITICAL: Filter out reported replies
            replies = obj.replies.filter(is_reported=False)

            # Staff can see reported replies for moderation
            request = self.context.get('request')
            if request and request.user.is_authenticated and request.user.is_staff:
                replies = obj.replies.all()

            replies = replies.order_by('created_at')
            return CommentReplySerializer(replies, many=True, context=self.context).data
        return []


class CommentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for comment creation"""

    class Meta:
        model = Comment
        fields = ['content', 'parent']

    def validate_content(self, value):
        """Basic content validation"""
        if not value or not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty")
        return value.strip()


class CommentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentReport
        fields = ['comment', 'reporter', 'report_type', 'description']

    def validate_report_type(self, value):
        """Validate report type"""
        valid_types = ['inappropriate_content', 'spam', 'fraud', 'copyright', 'harassment', 'other']
        if value not in valid_types:
            raise serializers.ValidationError("Invalid report type")
        return value

    def validate_description(self, value):
        """Validate description"""
        if not value or not value.strip():
            raise serializers.ValidationError("Description is required")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long")
        return value.strip()
