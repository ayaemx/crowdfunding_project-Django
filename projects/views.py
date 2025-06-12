from django.shortcuts import render, get_object_or_404, redirect
from .models import Project
from .forms import ProjectForm
from comments.models import HiddenComment


def project_list(request):
    """List all projects"""
    projects = Project.objects.filter(is_active=True).order_by('-created_at')

    context = {
        'projects': projects,
    }

    return render(request, 'projects/project_list.html', context)


def project_detail(request, pk):
    """Show project details"""
    project = get_object_or_404(Project, pk=pk)

    context = {
        'project': project,
    }

    return render(request, 'projects/project_detail.html', context)
def project_create(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES)
        if form.is_valid():
            project = form.save(commit=False)
            project.owner = request.user
            project.save()
            form.save_m2m()  # for ManyToMany fields
            return redirect('projects:project-detail', pk=project.pk)
    else:
        form = ProjectForm()
    return render(request, 'projects/project_form.html', {'form': form})

def project_edit(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES, instance=project)
        if form.is_valid():
            form.save()
            return redirect('projects:project-detail', pk=project.pk)
    else:
        form = ProjectForm(instance=project)
    return render(request, 'projects/project_form.html', {'form': form, 'edit_mode': True})

def project_delete(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.method == 'POST':
        project.delete()
        return redirect('projects:project-list')
    return render(request, 'projects/project_confirm_delete.html', {'project': project})
