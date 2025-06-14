from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ProjectViewSet

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')  # Empty prefix

urlpatterns = [
    path('', include(router.urls)),
]
