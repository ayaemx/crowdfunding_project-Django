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
    print("menna")

    return render(request, 'index.html', context)