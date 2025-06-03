from django.urls import path
from .views import homepage
from .api_views import ProjectListAPIView, LatestProjectsAPIView,  FeaturedProjectsAPIView
app_name = 'home'

urlpatterns = [
    path('', homepage, name='homepage'),
    path('api/home/', ProjectListAPIView.as_view(), name='api-project-list'),
    path('api/home/latest/', LatestProjectsAPIView.as_view(), name='api-latest-projects'),
    path('api/home /featured/', FeaturedProjectsAPIView.as_view(), name='api-featured-projects'),
]

