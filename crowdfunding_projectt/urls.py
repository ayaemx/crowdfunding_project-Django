"""
URL configuration for crowdfunding_projectt project.
... [keep the existing docstring] ...
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('projects.api_urls')),
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('users/', include('users.urls', namespace='users')),
    path('categories/', include('categories.urls', namespace='categories')),
    path('projects/', include('projects.urls', namespace='projects')),



    path('comments/', include('comments.urls')),

    path('home/', include('home.urls')),

    path('tags/', include('tags.urls')),
    path('api/comments/', include('comments.api.urls')),
    path('api/tags/', include('tags.api.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
