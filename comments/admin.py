from django.contrib import admin
from .models import Comment, CommentReport  # REMOVED: HiddenComment


# Register your models here
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'project', 'content_preview', 'is_reported', 'report_count', 'moderation_status',
                    'created_at']
    list_filter = ['is_reported', 'moderation_status', 'created_at']
    search_fields = ['content', 'user__username', 'project__title']
    readonly_fields = ['created_at', 'updated_at']

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = 'Content Preview'


@admin.register(CommentReport)
class CommentReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'comment', 'reporter', 'report_type', 'admin_action', 'created_at']
    list_filter = ['report_type', 'admin_action', 'is_reviewed', 'created_at']
    search_fields = ['description', 'reporter__username', 'comment__content']
    readonly_fields = ['created_at']
