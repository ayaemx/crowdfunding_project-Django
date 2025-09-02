# categories/api_views.py - FIXED IMPORTS AND SYNTAX

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from .models import Category
from .serializers import (
    CategorySerializer,
    CategoryListSerializer,
    CategoryWithProjectsSerializer
)

# ADD MISSING SERIALIZERS IF THEY DON'T EXIST
try:
    from .serializers import CategoryCreateSerializer
except ImportError:
    # Fallback to CategorySerializer if CategoryCreateSerializer doesn't exist
    CategoryCreateSerializer = CategorySerializer

class CategoryListCreateAPI(generics.ListCreateAPIView):
    """List all categories and create new categories (admin only)"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        """Get categories with project counts"""
        return Category.objects.annotate(
            projects_count=Count('projects', filter=Q(projects__is_active=True))
        ).order_by('name')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategoryCreateSerializer
        return CategorySerializer

    def create(self, request, *args, **kwargs):
        """Only admin users can create categories"""
        if not request.user.is_staff:
            return Response({
                'error': 'Only admin users can create categories'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class CategoryDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific category"""
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        """Get category with project count"""
        return Category.objects.annotate(
            projects_count=Count('projects', filter=Q(projects__is_active=True))
        )  # FIXED: Added missing closing parenthesis

    def get_permissions(self):
        """Different permissions for different methods"""
        if self.request.method == 'GET':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

class CategoryProjectsAPI(generics.ListAPIView):
    """Get all projects in a specific category"""
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Get active projects for the category"""
        category_slug = self.kwargs['slug']
        category = get_object_or_404(Category, slug=category_slug)
        return category.projects.filter(is_active=True).select_related('owner').prefetch_related('pictures', 'tags')

    def get_serializer_class(self):
        # Import here to avoid circular imports
        from projects.serializers import ProjectListSerializer
        return ProjectListSerializer

    def list(self, request, *args, **kwargs):
        """Custom response with category info"""
        try:
            category_slug = self.kwargs['slug']
            category = get_object_or_404(Category, slug=category_slug)
            projects = self.get_queryset()

            # Get serializer and serialize projects
            serializer_class = self.get_serializer_class()
            serializer = serializer_class(projects, many=True, context={'request': request})

            return Response({
                'category': CategorySerializer(category).data,
                'projects': serializer.data,
                'count': projects.count()
            })
        except Exception as e:
            return Response({
                'error': f'Failed to fetch category projects: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def categories_with_projects_api(request):
    """Get categories with recent projects for homepage"""
    try:
        categories = Category.objects.annotate(
            projects_count=Count('projects', filter=Q(projects__is_active=True))
        ).filter(projects_count__gt=0).order_by('-projects_count', 'name')

        serializer = CategoryWithProjectsSerializer(categories, many=True, context={'request': request})

        return Response({
            'categories': serializer.data,
            'count': categories.count(),
            'message': f'Found {categories.count()} categories with active projects' if categories.count() > 0 else 'No categories have projects yet'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch categories with projects: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def popular_categories_api(request):
    """Get most popular categories"""
    try:
        popular_categories = Category.objects.annotate(
            projects_count=Count('projects', filter=Q(projects__is_active=True))
        ).filter(projects_count__gte=1).order_by('-projects_count')[:10]  # FIXED: Lowered threshold to 1

        serializer = CategoryListSerializer(popular_categories, many=True)

        return Response({
            'popular_categories': serializer.data,
            'count': popular_categories.count(),
            'message': f'Found {popular_categories.count()} popular categories' if popular_categories.count() > 0 else 'No popular categories yet'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch popular categories: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
