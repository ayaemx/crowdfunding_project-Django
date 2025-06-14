from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.api_urls')),
    path('api/projects/', include('projects.api_urls')),
    path('api/categories/', include('categories.api_urls')),
    path('api/tags/', include('tags.api_urls')),
    path('api/comments/', include('comments.api_urls')),  # ADD BACK
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
