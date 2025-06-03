from rest_framework import serializers
from ..models import Comment, CommentReport, HiddenComment

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'project', 'content', 'created_at', 'parent']
        read_only_fields = ['user', 'created_at']

class CommentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentReport
        fields = ['comment', 'reason']
        read_only_fields = ['user']

class HiddenCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HiddenComment
        fields = ['comment']
        read_only_fields = ['user']