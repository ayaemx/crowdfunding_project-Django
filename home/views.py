from django.shortcuts import render, get_object_or_404
from django.db.models import Avg, Count, Q
from django.utils import timezone
from projects.models import Project
from categories.models import Category
from tags.models import Tag


def homepage(request):
    """Homepage view showing featured content"""
    now = timezone.now()

    # Highest rated running projects (5) - projects that have started but not ended
    highest_rated = Project.objects.filter(
        start_time__lte=now,
        end_time__gte=now
    ).annotate(
        avg_rating=Avg('ratings__value'),
        backers_count=Count('backers')
    ).order_by('-avg_rating')[:5]

    # Latest 5 projects with annotations
    latest_projects = Project.objects.annotate(
        backers_count=Count('backers')
    ).order_by('-created_at')[:5]

    # Featured projects (5) with annotations
    featured_projects = Project.objects.filter(
        is_featured=True
    ).annotate(
        backers_count=Count('backers')
    ).order_by('-featured_date')[:5]

    # Categories with project counts
    categories = Category.objects.annotate(
        project_count=Count('project')
    ).order_by('name')

    context = {
        'highest_rated': highest_rated,
        'latest_projects': latest_projects,
        'featured_projects': featured_projects,
        'categories': categories,
    }
    return render(request, 'home/homepage.html', context)


def tag_projects(request, tag_slug):
    """View showing projects for a specific tag"""
    tag = get_object_or_404(Tag, slug=tag_slug)
    projects = Project.objects.filter(
        tags=tag
    ).annotate(
        backers_count=Count('backers')
    ).order_by('-created_at')

    context = {
        'tag': tag,
        'projects': projects
    }
    return render(request, 'home/tag_projects.html', context)

# def search_projects(request):
#     """View for searching projects"""
#     query = request.GET.get('q', '').strip()
#
#     if query:
#         projects = Project.objects.filter(
#             Q(title__icontains=query) |
#             Q(description__icontains=query) |
#             Q(tags__name__icontains=query)
#         ).annotate(
#             backers_count=Count('backers')
#         ).distinct().order_by('-created_at')
#     else:
#         projects = Project.objects.none()
#
#     context = {
#         'projects': projects,
#         'query': query,
#         'results_count': projects.count()
#     }
#     return render(request, 'home/search_results.html', context)