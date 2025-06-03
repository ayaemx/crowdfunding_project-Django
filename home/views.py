from django.shortcuts import render
from projects.models import Project
from categories.models import Category

def homepage(request):
    # Highest rated projects for slider
    highest_rated = Project.objects.order_by('-rating')[:5]

    # Latest projects
    latest_projects = Project.objects.order_by('-created_at')[:5]

    # Featured projects
    featured_projects = Project.objects.filter(is_featured=True).order_by('-created_at')[:5]

    # All categories
    categories = Category.objects.all()

    context = {
        'highest_rated': highest_rated,
        'latest_projects': latest_projects,
        'featured_projects': featured_projects,
        'categories': categories,
    }

    return render(request, 'index.html', context)

def search_projects(request):
    query = request.GET.get('q', '')
    results = Project.objects.filter(
        models.Q(title=query) |
        models.Q(tags=query)
    )
    return render(request, 'index.html', {'results': results, 'query': query})