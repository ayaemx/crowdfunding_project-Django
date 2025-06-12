# home/api_views.py - NEW FILE FOR HOMEPAGE API
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Avg, Count, Q, Sum
from projects.models import Project
from categories.models import Category
from tags.models import Tag
from projects.serializers import ProjectListSerializer
from categories.serializers import CategoryListSerializer
from tags.serializers import TagSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def homepage_data_api(request):
    """Complete homepage data API for React frontend"""
    try:
        # 1. TOP 5 HIGHEST RATED RUNNING PROJECTS
        top_rated_projects = Project.objects.annotate(
            avg_rating=Avg('ratings__rating')
        ).filter(
            is_active=True,
            avg_rating__isnull=False
        ).order_by('-avg_rating')[:5]

        # 2. LATEST 5 PROJECTS
        latest_projects = Project.objects.filter(
            is_active=True
        ).order_by('-created_at')[:5]

        # 3. FEATURED PROJECTS (Admin Selected)
        featured_projects = Project.objects.filter(
            is_featured=True,
            is_active=True
        ).order_by('-created_at')[:5]

        # 4. CATEGORIES WITH PROJECT COUNTS
        categories = Category.objects.annotate(
            projects_count=Count('projects', filter=Q(projects__is_active=True))
        ).filter(projects_count__gt=0).order_by('name')

        # 5. POPULAR TAGS FOR SEARCH
        popular_tags = Tag.objects.annotate(
            projects_count=Count('projects', filter=Q(projects__is_active=True))
        ).filter(projects_count__gte=2).order_by('-projects_count')[:10]

        # 6. PLATFORM STATISTICS
        stats = {
            'total_projects': Project.objects.filter(is_active=True).count(),
            'total_categories': categories.count(),
            'total_funding_raised': Project.objects.filter(is_active=True).aggregate(
                total=Sum('donations__amount')
            )['total'] or 0,
            'total_users': User.objects.filter(is_active=True).count(),
        }

        return Response({
            'top_rated_projects': ProjectListSerializer(top_rated_projects, many=True,
                                                        context={'request': request}).data,
            'latest_projects': ProjectListSerializer(latest_projects, many=True, context={'request': request}).data,
            'featured_projects': ProjectListSerializer(featured_projects, many=True, context={'request': request}).data,
            'categories': CategoryListSerializer(categories, many=True).data,
            'popular_tags': TagSerializer(popular_tags, many=True).data,
            'stats': stats,
            'message': 'Homepage data loaded successfully'
        })

    except Exception as e:
        return Response({
            'error': f'Failed to load homepage data: {str(e)}',
            'top_rated_projects': [],
            'latest_projects': [],
            'featured_projects': [],
            'categories': [],
            'popular_tags': [],
            'stats': {}
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_projects_api(request):
    """Search API for React frontend"""
    query = request.GET.get('q', '').strip()

    if not query:
        return Response({
            'projects': [],
            'query': query,
            'count': 0,
            'message': 'Please provide a search query'
        })

    # Search by title or tag (PDF requirement)
    projects = Project.objects.filter(
        Q(title__icontains=query) | Q(tags__name__icontains=query),
        is_active=True
    ).distinct().select_related('owner', 'category').prefetch_related('pictures', 'tags')

    from projects.serializers import ProjectListSerializer

    return Response({
        'projects': ProjectListSerializer(projects, many=True, context={'request': request}).data,
        'query': query,
        'count': projects.count(),
        'message': f'Found {projects.count()} projects matching "{query}"'
    })