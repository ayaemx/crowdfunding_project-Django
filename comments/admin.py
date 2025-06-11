# comments/admin.py - ENHANCED ADMIN
from django.contrib import admin
from .models import Comment, CommentReport, HiddenComment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Enhanced admin for comments"""
    list_display = ['user', 'project', 'content_preview', 'created_at', 'replies_count']
    list_filter = ['created_at', 'project__category']
    search_fields = ['content', 'user__username', 'project__title']
    readonly_fields = ['created_at', 'updated_at', 'replies_count']

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "Content Preview"


@admin.register(CommentReport)
class CommentReportAdmin(admin.ModelAdmin):
    """Admin for comment reports"""
    list_display = ['user', 'comment_preview', 'reason', 'created_at', 'is_reviewed']
    list_filter = ['reason', 'is_reviewed', 'created_at']
    search_fields = ['user__username', 'comment__content']
    actions = ['mark_reviewed']

    def comment_preview(self, obj):
        return obj.comment.content[:30] + "..." if len(obj.comment.content) > 30 else obj.comment.content

    comment_preview.short_description = "Reported Comment"

    def mark_reviewed(self, request, queryset):
        queryset.update(is_reviewed=True)
        self.message_user(request, f"{queryset.count()} reports marked as reviewed.")

    mark_reviewed.short_description = "Mark as reviewed"


@admin.register(HiddenComment)
class HiddenCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'comment_preview', 'created_at']

    def comment_preview(self, obj):
        return obj.comment.content[:30] + "..."

    comment_preview.short_description = "Hidden Comment"
