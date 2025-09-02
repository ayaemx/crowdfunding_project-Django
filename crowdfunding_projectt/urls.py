from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ADMIN
    path('admin/', admin.site.urls),

    # API ENDPOINTS - FIXED STRUCTURE
    path('api/auth/', include('users.api_urls')),  # ADD THIS
    path('api/projects/', include('projects.api_urls')),
    path('api/categories/', include('categories.api_urls')),
    path('api/tags/', include('tags.api_urls')),
    path('api/comments/', include('comments.api_urls')),

    # TEMPLATE VIEWS
    path('', include('home.urls')),
    path('users/', include('users.urls')),
    path('projects/', include('projects.urls')),
    path('comments/', include('comments.urls')),
    path('tags/', include('tags.urls')),
    path('categories/', include('categories.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
