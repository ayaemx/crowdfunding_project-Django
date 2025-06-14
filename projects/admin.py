from django.contrib import admin
from django.db import models
from .models import Project, ProjectPicture, Donation, Rating, ProjectReport


class ProjectPictureInline(admin.TabularInline):
    model = Project.pictures.through
    extra = 1
    verbose_name = "Project Picture"
    verbose_name_plural = "Project Pictures"


class DonationInline(admin.TabularInline):
    model = Donation
    extra = 0
    readonly_fields = ['donor', 'amount', 'donation_date']  # FIXED: Changed 'user' to 'donor'
    can_delete = False


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'current_amount_display', 'funding_percentage_display',
                    'average_rating_display', 'is_featured']
    list_filter = ['category', 'is_featured', 'is_active', 'created_at']
    search_fields = ['title', 'details', 'owner__username']
    readonly_fields = ['current_amount_display', 'funding_percentage_display', 'average_rating_display',
                       'total_ratings_display', 'created_at', 'updated_at']
    filter_horizontal = ['tags']
    inlines = [DonationInline, ProjectPictureInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'details', 'category', 'owner')
        }),
        ('Financial', {
            'fields': ('total_target', 'currency', 'current_amount_display', 'funding_percentage_display')
        }),
        ('Timeline', {
            'fields': ('start_time', 'end_time')
        }),
        ('Classification', {
            'fields': ('tags', 'is_featured', 'is_active')
        }),
        ('Statistics', {
            'fields': ('average_rating_display', 'total_ratings_display'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # FIXED: Create proper admin display methods based on search results
    @admin.display(description='Current Amount')
    def current_amount_display(self, obj):
        """Display current donation amount"""
        total = obj.donations.aggregate(total=models.Sum('amount'))['total']
        return f"{total or 0} {obj.currency}"

    @admin.display(description='Funding %')
    def funding_percentage_display(self, obj):
        """Display funding percentage"""
        total = obj.donations.aggregate(total=models.Sum('amount'))['total'] or 0
        if obj.total_target > 0:
            percentage = (total / obj.total_target) * 100
            return f"{percentage:.1f}%"
        return "0%"

    @admin.display(description='Avg Rating')
    def average_rating_display(self, obj):
        """Display average rating"""
        avg = obj.ratings.aggregate(avg=models.Avg('rating'))['avg']
        return f"{avg:.1f}" if avg else "No ratings"

    @admin.display(description='Total Ratings')
    def total_ratings_display(self, obj):
        """Display total number of ratings"""
        return obj.ratings.count()


@admin.register(ProjectPicture)
class ProjectPictureAdmin(admin.ModelAdmin):
    list_display = ['id', 'image', 'is_main', 'order', 'uploaded_at']
    list_filter = ['is_main', 'uploaded_at']
    list_editable = ['is_main', 'order']
    ordering = ['-is_main', 'order']


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['donor_display', 'project', 'amount', 'donation_date']  # FIXED: Changed 'user' to 'donor_display'
    list_filter = ['donation_date', 'amount']
    search_fields = ['donor__username', 'donor__email', 'project__title']  # FIXED: Changed 'user' to 'donor'
    readonly_fields = ['donor', 'project', 'amount', 'donation_date']
    date_hierarchy = 'donation_date'

    # FIXED: Create method to display donor info
    @admin.display(description='Donor')
    def donor_display(self, obj):
        """Display donor information"""
        return f"{obj.donor.first_name} {obj.donor.last_name}" if obj.donor.first_name else obj.donor.username


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'project__title']
    readonly_fields = ['user', 'project', 'created_at', 'updated_at']


@admin.register(ProjectReport)
class ProjectReportAdmin(admin.ModelAdmin):
    list_display = ['project', 'reporter_display', 'report_type_display', 'created_at',
                    'is_reviewed']  # FIXED: Changed field names
    list_filter = ['report_type', 'is_reviewed', 'created_at']  # FIXED: Changed 'reason' to 'report_type'
    search_fields = ['project__title', 'reporter__username', 'description']  # FIXED: Changed 'user' to 'reporter'
    readonly_fields = ['project', 'reporter', 'created_at']
    list_editable = ['is_reviewed']

    # FIXED: Create proper display methods
    @admin.display(description='Reporter')
    def reporter_display(self, obj):
        """Display reporter information"""
        return f"{obj.reporter.first_name} {obj.reporter.last_name}" if obj.reporter.first_name else obj.reporter.username

    @admin.display(description='Report Type')
    def report_type_display(self, obj):
        """Display report type with better formatting"""
        return obj.get_report_type_display()

    actions = ['mark_as_reviewed', 'mark_as_unreviewed']

    @admin.action(description='Mark selected reports as reviewed')
    def mark_as_reviewed(self, request, queryset):
        updated = queryset.update(is_reviewed=True)
        self.message_user(request, f'{updated} reports marked as reviewed.')

    @admin.action(description='Mark selected reports as unreviewed')
    def mark_as_unreviewed(self, request, queryset):
        updated = queryset.update(is_reviewed=False)
        self.message_user(request, f'{updated} reports marked as unreviewed.')
