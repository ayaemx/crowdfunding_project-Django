from django.urls import path
from .api_views import ProjectListAPIView, LatestProjectsAPIView, FeaturedProjectsAPIView

urlpatterns = [
    path('home/', ProjectListAPIView.as_view(), name='project-list'),
    path('home/latest/', LatestProjectsAPIView.as_view(), name='latest-projects'),
    path('home/featured/', FeaturedProjectsAPIView.as_view(), name='featured-projects'),
]