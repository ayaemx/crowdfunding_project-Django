from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced admin for custom User model"""

    # Display in admin list
    list_display = ('email', 'username', 'full_name', 'mobile_phone', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_staff', 'country', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'mobile_phone')
    ordering = ('-created_at',)

    # Detail view fieldsets
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('mobile_phone', 'profile_picture', 'birthdate',
                       'facebook_profile', 'country', 'created_at', 'updated_at')
        }),
    )

    # Add form fieldsets
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('first_name', 'last_name', 'email', 'mobile_phone', 'profile_picture')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def full_name(self, obj):
        return obj.full_name

    full_name.short_description = 'Full Name'
