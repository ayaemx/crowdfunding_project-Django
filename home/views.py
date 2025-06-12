# home/views.py - FIXED VERSION WITH PROPER IMPORTS
from django.shortcuts import render
from django.db.models import Avg, Count, Q
from django.utils import timezone  # *** ADD MISSING IMPORT ***
from projects.models import Project
from categories.models import Category
from tags.models import Tag


def home_view(request):
    """Complete homepage view with debug info"""
    print("=== HOME VIEW DEBUG ===")

    try:
        # 1. Latest 5 projects
        latest_projects = Project.objects.filter(is_active=True).order_by('-created_at')[:5]
        print(f"Latest projects: {latest_projects.count()}")

        # 2. Categories with project counts
        categories = Category.objects.annotate(
            projects_count=Count('projects', filter=Q(projects__is_active=True))
        ).order_by('name')
        print(f"Categories: {categories.count()}")

        # 3. Top rated projects (if any)
        top_rated_projects = Project.objects.annotate(
            avg_rating=Avg('ratings__rating')
        ).filter(
            is_active=True,
            avg_rating__isnull=False
        ).order_by('-avg_rating')[:5]
        print(f"Top rated projects: {top_rated_projects.count()}")

        # 4. Featured projects
        featured_projects = Project.objects.filter(
            is_featured=True,
            is_active=True
        ).order_by('-created_at')[:5]
        print(f"Featured projects: {featured_projects.count()}")

        context = {
            'latest_projects': latest_projects,
            'categories': categories,
            'top_rated_projects': top_rated_projects,
            'featured_projects': featured_projects,
            'total_projects': Project.objects.filter(is_active=True).count(),
            'total_categories': categories.count(),
        }

        print(f"Context keys: {list(context.keys())}")
        print("=== END HOME DEBUG ===")

    except Exception as e:
        print(f"ERROR in home view: {str(e)}")
        # Fallback context
        context = {
            'latest_projects': [],
            'categories': [],
            'top_rated_projects': [],
            'featured_projects': [],
            'error': str(e),
            'total_projects': 0,
            'total_categories': 0,
        }

    return render(request, 'home/index.html', context)


def search_view(request):
    """Search functionality"""
    query = request.GET.get('q', '').strip()
    projects = []
    search_performed = False

    if query:
        search_performed = True
        projects = Project.objects.filter(
            Q(title__icontains=query) | Q(tags__name__icontains=query),
            is_active=True
        ).distinct()

    context = {
        'query': query,
        'projects': projects,
        'search_performed': search_performed,
        'results_count': projects.count() if search_performed else 0,
    }

    return render(request, 'home/search_results.html', context)


def about_view(request):
    """About page"""
    return render(request, 'home/about.html', {})
