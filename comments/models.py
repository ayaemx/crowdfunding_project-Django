from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Comment(models.Model):
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=1000)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ENHANCED: Better moderation fields
    is_reported = models.BooleanField(default=False)
    report_count = models.PositiveIntegerField(default=0)
    is_hidden_by_admin = models.BooleanField(default=False)
    moderation_status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('under_review', 'Under Review'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected/Hidden'),
        ],
        default='active'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.user.username} on {self.project.title}'

    @property
    def should_be_hidden(self):
        """Determine if comment should be hidden based on reports"""
        # Hide if admin explicitly hid it
        if self.is_hidden_by_admin:
            return True
        # Hide if too many reports (threshold: 3 reports)
        if self.report_count >= 3:
            return True
        return False


class CommentReport(models.Model):
    REPORT_TYPES = [
        ('inappropriate_content', 'Inappropriate Content'),
        ('spam', 'Spam'),
        ('fraud', 'Fraud/Scam'),
        ('copyright', 'Copyright Violation'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    ]

    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_reports')
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    description = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)
    admin_action = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Report Approved'),
            ('dismissed', 'Report Dismissed'),
        ],
        default='pending'
    )

    class Meta:
        unique_together = ['comment', 'reporter']
        ordering = ['-created_at']

    def __str__(self):
        return f"Report: {self.comment.id} by {self.reporter.username} ({self.report_type})"


# ADDED: Missing HiddenComment model
class HiddenComment(models.Model):
    comment = models.OneToOneField(Comment, on_delete=models.CASCADE, related_name='hidden_info')
    hidden_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hidden_comments')
    reason = models.TextField(max_length=500)
    hidden_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Hidden comment {self.comment.id} by {self.hidden_by.username}'
