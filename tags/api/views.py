from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from projects.models import Project
from ..models import Tag
from .serializers import TagSerializer

# GET /api/tags/
class TagListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all unique tag names
        tag_names = Tag.objects.values_list('name', flat=True).distinct()
        return Response({"tags": list(tag_names)})

# POST /api/tags/
class CreateTagView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TagSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Set the user before saving
            tag = serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# GET /api/tags/search/?tag=python
class SearchByTagView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('tag', '')
        if query:
            projects = Project.objects.filter(tags__name__icontains=query).distinct()
            project_data = [{"title": p.title, "description": p.description} for p in projects]
            return Response({"results": project_data, "query": query})
        return Response({"error": "No tag provided"}, status=status.HTTP_400_BAD_REQUEST)

# GET /api/tags/<str:tag_name>/
class ProjectsByTagView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tag_name):
        tag = Tag.objects.filter(name=tag_name).first()
        if not tag:
            return Response({"error": f"No projects found for tag '{tag_name}'"}, status=status.HTTP_404_NOT_FOUND)

        projects = Project.objects.filter(tags=tag).distinct()
        project_data = [{"title": p.title, "description": p.description} for p in projects]
        return Response({"tag": tag_name, "projects": project_data})