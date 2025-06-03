from rest_framework import generics
from projects.models import Project
from .serializers import ProjectSerializer

class ProjectListAPIView(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class LatestProjectsAPIView(generics.ListAPIView):
    queryset = Project.objects.order_by('-created_at')[:5]
    serializer_class = ProjectSerializer

class FeaturedProjectsAPIView(generics.ListAPIView):
    queryset = Project.objects.filter(is_featured=True).order_by('-created_at')[:5]
    serializer_class = ProjectSerializer

# class SearchProjectsAPIView(generics.SearchAPIView):
#     query =  Project.objects.filter(
#         models.Q(title=query) |  models.Q(tags=query))
#     serializer_class = ProjectSerializer