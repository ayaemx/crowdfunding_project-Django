# crowdfunding_projectt/urls.py - FIXED VERSION
"""
URL configuration for crowdfunding_projectt project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # ===== API ENDPOINTS (for React frontend) =====
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.api_urls')),
    path('api/projects/', include('projects.api_urls')),  # Keep projects/ prefix here
    path('api/categories/', include('categories.api_urls')),
    path('api/tags/', include('tags.api_urls')),
    path('api/comments/', include('comments.api_urls')),
    # ===== TEMPLATE VIEWS (for testing) =====
    path('', include('home.urls')),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('users/', include('users.urls')),  # Template views only
    path('projects/', include('projects.urls')),
    path('comments/', include('comments.urls')),
    path('tags/', include('tags.urls')),
    path('categories/', include('categories.urls')),
                  # Enable when ready
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)