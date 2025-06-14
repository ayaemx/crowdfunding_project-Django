from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # FIXED: Changed mobile_phone to phone_number
    list_display = ['email', 'first_name', 'last_name', 'phone_number', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login']
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']

    # FIXED: Updated fieldsets to use phone_number
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'phone_number', 'profile_picture', 'birthdate', 'facebook_profile',
                       'country')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone_number', 'password1', 'password2'),
        }),
    )

    # Custom admin methods
    @admin.display(description='Profile Picture')
    def profile_picture_display(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%;" />',
                               obj.profile_picture.url)
        return "No Image"

    @admin.display(description='Projects Count')
    def projects_count_display(self, obj):
        return obj.projects_count

    @admin.display(description='Total Donated')
    def total_donated_display(self, obj):
        return f"{obj.total_donated} EGP"

    # Add these to list_display if needed
    # list_display = [..., 'profile_picture_display', 'projects_count_display', 'total_donated_display']
