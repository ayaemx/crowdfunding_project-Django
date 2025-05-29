from django.shortcuts import render, redirect, get_object_or_404
from .models import Project, ProjectPicture
from .forms import ProjectForm, ProjectPictureForm
from django.contrib.auth.decorators import login_required

# List projects
def project_list(request):
    projects = Project.objects.all()
    return render(request, 'projects/project_list.html', {'projects': projects})

# View a single project
def project_detail(request, pk):
    project = get_object_or_404(Project, pk=pk)
    return render(request, 'projects/project_detail.html', {'project': project})

# Create a new project
@login_required
def project_create(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        files = request.FILES.getlist('images')
        if form.is_valid():
            project = form.save(commit=False)
            project.owner = request.user
            project.save()
            form.save_m2m()
            for f in files:
                picture = ProjectPicture.objects.create(image=f)
                project.pictures.add(picture)
            return redirect('project_detail', pk=project.pk)
    else:
        form = ProjectForm()
    return render(request, 'projects/project_form.html', {'form': form})

# Edit a project
@login_required
def project_edit(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.user != project.owner:
        return redirect('project_detail', pk=pk)
    if request.method == 'POST':
        form = ProjectForm(request.POST, instance=project)
        if form.is_valid():
            form.save()
            return redirect('project_detail', pk=pk)
    else:
        form = ProjectForm(instance=project)
    return render(request, 'projects/project_form.html', {'form': form})

# Delete a project
@login_required
def project_delete(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.user == project.owner:
        project.delete()
    return redirect('project_list')
