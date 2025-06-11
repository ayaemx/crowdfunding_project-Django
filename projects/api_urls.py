# projects/api_urls.py - CORRECTED VERSION
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ProjectViewSet

# Create router for API endpoints
router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]

# This creates the following API endpoints:
# GET/POST     /api/projects/                    -> List/Create projects
# GET/PUT/DEL  /api/projects/{id}/               -> Retrieve/Update/Delete project
# POST         /api/projects/{id}/donate/        -> Donate to project
# POST         /api/projects/{id}/rate/          -> Rate project
# POST         /api/projects/{id}/report/        -> Report project
# POST         /api/projects/{id}/upload_images/ -> Upload project images
# GET          /api/projects/homepage_data/      -> Homepage data
