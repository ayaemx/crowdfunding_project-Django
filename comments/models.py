# comments/models.py - COMPLETE VERSION
from django.db import models
from django.conf import settings
from projects.models import Project


class Comment(models.Model):
    """Comment model with threading support for replies"""
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # For bonus: comment replies (threading)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )

    class Meta:
        ordering = ['-created_at']

    @property
    def replies_count(self):
        """Count of replies to this comment"""
        return self.replies.filter().count()

    @property
    def is_reply(self):
        """Check if this comment is a reply to another comment"""
        return self.parent is not None

    def __str__(self):
        return f"Comment by {self.user.username} on {self.project.title}"


class CommentReport(models.Model):
    """Model for reporting inappropriate comments"""
    SPAM = 'spam'
    INAPPROPRIATE = 'inappropriate'
    HARASSMENT = 'harassment'
    OFFENSIVE = 'offensive'
    OTHER = 'other'

    REASON_CHOICES = [
        (SPAM, 'Spam Content'),
        (INAPPROPRIATE, 'Inappropriate Content'),
        (HARASSMENT, 'Harassment'),
        (OFFENSIVE, 'Offensive Language'),
        (OTHER, 'Other Reason'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comment_reports'
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default=OTHER)
    details = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'comment')
        ordering = ['-created_at']

    def __str__(self):
        return f"Report by {self.user.username} on comment {self.comment.id} ({self.reason})"


class HiddenComment(models.Model):
    """Model for users to hide comments they've reported"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hidden_comments'
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name='hidden_by_users'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'comment')

    def __str__(self):
        return f"{self.user.username} hid comment {self.comment.id}"
