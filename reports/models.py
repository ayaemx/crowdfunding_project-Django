from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

class Report(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=50, choices=[('funding', 'Funding'), ('activity', 'Activity')])
    details = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.project.title} - {self.report_type} by {self.user.username}"
