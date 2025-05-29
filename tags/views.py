from django.shortcuts import render, get_object_or_404
from tags.models import Tag
from django.db.models import Q
from projects.models import Project

# Create your views here.
def tag_list(request):
    """
        Displays a list of all unique tag names in the system.
        Used to show all available tags to users.
    """
    tags= Tag.objects.all().distict('name')
    return render(request, 'tags/list.html',{'tags':tags})

def search_by_tag(request):
    """
        Allows users to search for projects using a tag name via a search form.
        Returns matching projects if a query is provided.
    """
    query = request.GET.get('tag', '')  # Get the 'tag' parameter from the URL
    projects = []

    if query:
        # Filter projects whose tags contain the query (case-insensitive)

        projects = Project.objects.filter(tags__name__icontains=query).distinct()

    return render(request, 'tags/search_results.html', {
        'projects': projects,
        'query': query
    })

def projects_by_tag(request, tag_name):
    """
        Shows all projects that are tagged with a specific tag name.
    """

    # Get the tag object or return 404 if not found
    tag = get_object_or_404(Tag, name=tag_name)

    # Find all projects associated with this tag
    projects = Project.objects.filter(tags=tag).distinct()
    return render(request, 'tags/projects_by_tag.html', {
        'tag': tag,
        'projects': projects
    })

def similar_projects(request, project_id):
    """
       Shows up to 4 projects that share at least one tag with the current project.
       Helps users discover related campaigns.
    """
    project = get_object_or_404(Project, id=project_id)
    tags = project.tags.all()

    # Find other projects with any of these tags, exclude the current project
    similar_projects = Project.objects.filter(tags__in=tags).exclude(id=project.id).distinct()[:4]

    return render(request, 'tags/similar_projects.html', {
        'project': project,
        'similar_projects': similar_projects
    })