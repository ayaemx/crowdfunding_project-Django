from django.db import models
from django.conf import settings
from projects.models import Project

class Report(models.Model):
    FUNDING = 'funding'
    ACTIVITY = 'activity'
    REPORT_TYPE_CHOICES = [
        (FUNDING, 'Funding'),
        (ACTIVITY, 'Activity'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    details = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.project} - {self.report_type} by {self.user}"
