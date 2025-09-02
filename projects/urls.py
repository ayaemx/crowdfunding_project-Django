from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api_views

# API Router
router = DefaultRouter()
router.register(r'projects', api_views.ProjectViewSet, basename='project')

app_name = 'projects'

urlpatterns = [
    # API URLs
    path('api/', include(router.urls)),

    # Template views for testing
    path('', views.project_list, name='project-list'),
    path('create/', views.project_create, name='project-add'),
    path('<int:pk>/', views.project_detail, name='project-detail'),
    path('<int:pk>/edit/', views.project_edit, name='project-edit'),
    path('<int:pk>/delete/', views.project_delete, name='project-delete'),
]
