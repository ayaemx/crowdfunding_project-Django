from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    # Template views for testing
    path('', views.project_list, name='project-list'),
    path('create/', views.project_create, name='project-create'),
    path('<int:pk>/', views.project_detail, name='project-detail'),
    path('<int:pk>/edit/', views.project_edit, name='project-edit'),
    path('<int:pk>/delete/', views.project_delete, name='project-delete'),
]
