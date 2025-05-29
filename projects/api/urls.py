from django.urls import path
from .views import ProjectListCreateAPIView, ProjectDetailAPIView

urlpatterns = [
    path('projects/', ProjectListCreateAPIView.as_view(), name='api_project_list'),
    path('projects/<int:pk>/', ProjectDetailAPIView.as_view(), name='api_project_detail'),
]
