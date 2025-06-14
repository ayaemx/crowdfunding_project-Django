from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class ProjectPicture(models.Model):
    """Enhanced picture model for main + multiple pictures"""
    image = models.ImageField(upload_to='project_pictures/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_main = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_main', 'order', 'uploaded_at']

    def __str__(self):
        return f"Picture {self.id} ({'Main' if self.is_main else 'Additional'})"


class Project(models.Model):
    """Enhanced project model with all PDF requirements"""
    USD = 'USD'
    EUR = 'EUR'
    EGP = 'EGP'
    CURRENCY_CHOICES = [
        (USD, 'US Dollar'),
        (EUR, 'Euro'),
        (EGP, 'Egyptian Pound'),
    ]

    # Basic project info
    title = models.CharField(max_length=200)
    details = models.TextField()
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projects'
    )

    # Pictures and media
    pictures = models.ManyToManyField(ProjectPicture, blank=True, related_name='projects')

    # Financial info
    total_target = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default=EGP)

    # Categorization
    tags = models.ManyToManyField('tags.Tag', blank=True, related_name='projects')

    # Time management
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    # Ownership and metadata
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # REMOVED ALL CONFLICTING PROPERTIES

    @property
    def can_be_cancelled(self):
        """Project can be cancelled if <25% funded (PDF requirement)"""
        from django.db.models import Sum
        total_donations = self.donations.aggregate(total=Sum('amount'))['total'] or 0
        if self.total_target > 0:
            return (total_donations / self.total_target) * 100 < 25
        return True

    @property
    def is_running(self):
        """Check if project is currently running"""
        now = timezone.now()
        return self.start_time <= now <= self.end_time and self.is_active

    @property
    def main_picture(self):
        """Get main project picture"""
        return self.pictures.filter(is_main=True).first() or self.pictures.first()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Donation(models.Model):
    """User donations to projects"""
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(1)])
    donation_date = models.DateTimeField(auto_now_add=True)
    message = models.TextField(blank=True, null=True, max_length=500)
    is_anonymous = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.donor.username} donated {self.amount} to {self.project.title}"

    class Meta:
        ordering = ['-donation_date']


class Rating(models.Model):
    """Project ratings (1-5 stars)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True, null=True, max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'project')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} rated {self.project.title}: {self.rating}/5"


class ProjectReport(models.Model):
    """Report inappropriate projects"""
    # UPDATED: Match the choices from ReportModal.js
    REPORT_TYPES = [
        ('inappropriate_content', 'Inappropriate Content'),
        ('spam', 'Spam'),
        ('fraud', 'Fraud/Scam'),
        ('copyright', 'Copyright Violation'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_reports')
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)  # Increased max_length
    description = models.TextField(help_text="Provide additional details about the report")
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('reporter', 'project')
        ordering = ['-created_at']

    def __str__(self):
        return f"Report: {self.project.title} by {self.reporter.username} ({self.report_type})"
