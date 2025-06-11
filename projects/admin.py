from django.contrib import admin
from .models import Project, ProjectPicture, Donation, Rating, ProjectReport


# *** NEW: Enhanced admin with proper relationships ***
class ProjectPictureInline(admin.TabularInline):
    """Inline editing for project pictures"""
    model = Project.pictures.through
    extra = 1


class DonationInline(admin.TabularInline):
    """Inline editing for donations"""
    model = Donation
    extra = 0
    readonly_fields = ['user', 'amount', 'donation_date']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Enhanced project admin with all features"""
    list_display = ['title', 'owner', 'total_target', 'current_amount', 'funding_percentage', 'average_rating',
                    'is_featured', 'is_active']
    list_filter = ['is_featured', 'is_active', 'category', 'currency', 'created_at']
    search_fields = ['title', 'details', 'owner__username']
    readonly_fields = ['current_amount', 'funding_percentage', 'average_rating', 'total_ratings', 'created_at',
                       'updated_at']
    filter_horizontal = ['tags', 'pictures']
    inlines = [DonationInline]

    fieldsets = [
        ('Basic Info', {
            'fields': ['title', 'details', 'owner', 'category']
        }),
        ('Financial', {
            'fields': ['total_target', 'currency', 'current_amount', 'funding_percentage']
        }),
        ('Media & Tags', {
            'fields': ['pictures', 'tags']
        }),
        ('Time Management', {
            'fields': ['start_time', 'end_time']
        }),
        ('Status & Ratings', {
            'fields': ['is_featured', 'is_active', 'average_rating', 'total_ratings']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at']
        }),
    ]


@admin.register(ProjectPicture)
class ProjectPictureAdmin(admin.ModelAdmin):
    """Admin for project pictures"""
    list_display = ['id', 'image', 'is_main', 'order', 'uploaded_at']
    list_filter = ['is_main', 'uploaded_at']


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    """Admin for donations"""
    list_display = ['user', 'project', 'amount', 'is_anonymous', 'donation_date']
    list_filter = ['is_anonymous', 'donation_date']
    readonly_fields = ['donation_date']


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    """Admin for ratings"""
    list_display = ['user', 'project', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']


@admin.register(ProjectReport)
class ProjectReportAdmin(admin.ModelAdmin):
    """Admin for project reports"""
    list_display = ['user', 'project', 'reason', 'is_reviewed', 'created_at']
    list_filter = ['reason', 'is_reviewed', 'created_at']
    actions = ['mark_as_reviewed']

    def mark_as_reviewed(self, request, queryset):
        queryset.update(is_reviewed=True)

    mark_as_reviewed.short_description = "Mark selected reports as reviewed"
