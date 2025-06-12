# tags/api_views.py - COMPLETE WORKING VERSION
from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from .models import Tag
from .serializers import TagSerializer, TagCreateSerializer, PopularTagsSerializer


class TagListCreateAPI(generics.ListCreateAPIView):
    """Tags with built-in search functionality"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Built-in DRF search support
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        """Get tags with annotated project counts"""
        return Tag.objects.annotate(
            projects_count=Count('projects')
        ).order_by('-projects_count', 'name')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TagCreateSerializer
        return TagSerializer


class TagDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific tag"""
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        return Tag.objects.annotate(
            projects_count=Count('projects')
        )  # *** FIXED: Added missing closing parenthesis ***


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_tags_api(request):
    """FIXED: Custom search - always return 200, never 404"""
    query = request.GET.get('q', '').strip()  # *** FIXED: Define query first ***

    try:
        if not query:
            return Response({
                'tags': [],
                'query': query,
                'count': 0,
                'message': 'Please provide a search query'
            }, status=status.HTTP_200_OK)

        tags = Tag.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        ).annotate(
            projects_count=Count('projects')
        ).order_by('-projects_count', 'name')

        # *** FIXED: Always return 200 with results or empty array ***
        serializer = TagSerializer(tags, many=True)
        return Response({
            'tags': serializer.data,
            'query': query,
            'count': tags.count(),
            'message': f'Found {tags.count()} tag(s) matching "{query}"'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Search failed: {str(e)}',
            'tags': [],
            'query': query,  # *** FIXED: query is now defined ***
            'count': 0
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def popular_tags_api(request):
    """FIXED: Popular tags - return any tags with projects"""
    try:
        # *** FIXED: Return any tags that have projects (no minimum threshold) ***
        popular_tags = Tag.objects.annotate(
            projects_count=Count('projects')
        ).filter(projects_count__gt=0).order_by('-projects_count')[:10]

        serializer = PopularTagsSerializer(popular_tags, many=True)
        return Response({
            'popular_tags': serializer.data,
            'count': popular_tags.count(),
            'message': f'Found {popular_tags.count()} popular tags'
        }, status=status.HTTP_200_OK)  # *** ALWAYS 200 OK ***

    except Exception as e:
        return Response({
            'error': f'Failed to fetch popular tags: {str(e)}',
            'popular_tags': [],
            'count': 0
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tag_projects_api(request, tag_slug):
    """Get all projects for a specific tag"""
    try:
        tag = get_object_or_404(Tag, slug=tag_slug)
        tag_with_count = Tag.objects.annotate(
            projects_count=Count('projects')
        ).get(slug=tag_slug)

        projects = tag.projects.filter(is_active=True)

        return Response({
            'tag': TagSerializer(tag_with_count).data,
            'projects_count': projects.count(),
            'message': f'Found {projects.count()} projects with tag "{tag.name}"'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch projects for tag: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
