from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Sum, Avg
from django.utils import timezone


class ProjectPicture(models.Model):
    """Enhanced picture model for main + multiple pictures"""
    image = models.ImageField(upload_to='project_pictures/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_main = models.BooleanField(default=False)  # *** NEW: Mark main picture ***
    order = models.PositiveIntegerField(default=0)  # *** NEW: Picture ordering ***

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
    total_target = models.DecimalField(max_digits=12, decimal_places=2)  # *** UPDATED: Larger max_digits ***
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
    is_featured = models.BooleanField(default=False)  # *** KEEP: Admin can feature projects ***
    is_active = models.BooleanField(default=True)  # *** NEW: Project activation status ***

    # *** REMOVED: rating field (replaced with calculated average) ***

    # *** NEW: Calculated properties for PDF requirements ***
    @property
    def current_amount(self):
        """Calculate total donations received"""
        total = self.donations.aggregate(total=Sum('amount'))['total']
        return total or 0

    @property
    def funding_percentage(self):
        """Calculate funding percentage"""
        if self.total_target > 0:
            return (self.current_amount / self.total_target) * 100
        return 0

    @property
    def can_be_cancelled(self):
        """Project can be cancelled if <25% funded (PDF requirement)"""
        return self.funding_percentage < 25

    @property
    def average_rating(self):
        """Calculate average rating from user ratings"""
        avg = self.ratings.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 2) if avg else 0

    @property
    def total_ratings(self):
        """Count total ratings"""
        return self.ratings.count()

    @property
    def is_running(self):
        """Check if project is currently running"""
        now = timezone.now()
        return self.start_time <= now <= self.end_time and self.is_active

    @property
    def similar_projects(self):
        """Get 4 similar projects based on tags (PDF requirement)"""
        if not self.tags.exists():
            return Project.objects.none()

        return Project.objects.filter(
            tags__in=self.tags.all(),
            is_active=True
        ).exclude(id=self.id).distinct()[:4]

    @property
    def main_picture(self):
        """Get main project picture"""
        return self.pictures.filter(is_main=True).first() or self.pictures.first()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


# *** NEW: Donation model for PDF requirements ***
class Donation(models.Model):
    """User donations to projects"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(1)])
    donation_date = models.DateTimeField(auto_now_add=True)

    # *** NEW: Optional donation features ***
    message = models.TextField(blank=True, null=True, max_length=500)  # Donation message
    is_anonymous = models.BooleanField(default=False)  # Anonymous donations

    def __str__(self):
        return f"{self.user.username} donated {self.amount} to {self.project.title}"

    class Meta:
        ordering = ['-donation_date']


# *** NEW: Rating model for PDF requirements ***
class Rating(models.Model):
    """Project ratings (1-5 stars)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True, null=True, max_length=1000)  # *** NEW: Optional review text ***
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'project')  # *** NEW: One rating per user per project ***
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} rated {self.project.title}: {self.rating}/5"


# *** NEW: Project reporting model for PDF requirements ***
class ProjectReport(models.Model):
    """Report inappropriate projects"""
    SPAM = 'spam'
    INAPPROPRIATE = 'inappropriate'
    FRAUD = 'fraud'
    FAKE_CAMPAIGN = 'fake_campaign'
    OTHER = 'other'

    REASON_CHOICES = [
        (SPAM, 'Spam Content'),
        (INAPPROPRIATE, 'Inappropriate Content'),
        (FRAUD, 'Fraudulent Activity'),
        (FAKE_CAMPAIGN, 'Fake Campaign'),
        (OTHER, 'Other Reason'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_reports')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    details = models.TextField(help_text="Provide additional details about the report")
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)  # *** NEW: For admin review ***

    class Meta:
        unique_together = ('user', 'project')  # *** NEW: One report per user per project ***
        ordering = ['-created_at']

    def __str__(self):
        return f"Report: {self.project.title} by {self.user.username} ({self.reason})"
