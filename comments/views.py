from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from projects.models import Project
from .models import Comment
from .forms import CommentForm, CommentReportForm
# Create your views here.


# Add a main comment to a project
@login_required
def add_comment(request, pk):
    project = get_object_or_404(Project, id=pk)

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.project = project  # Set the project
            comment.user = request.user  # Set the logged-in user
            comment.save()
            return redirect('projects:project-detail', pk=project.id)
    else:
        form = CommentForm()

    return render(request, 'comments/add_comment.html', {'form': form, 'project': project})

# Reply to an existing comment
@login_required
def reply_comment(request, comment_id):
    parent_comment = get_object_or_404(Comment, id=comment_id)
    project = parent_comment.project

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            reply = form.save(commit=False)
            reply.project = project
            reply.user = request.user
            reply.parent = parent_comment  # Set the parent comment
            reply.save()
            return redirect('projects:project-detail', pk=project.id)
    else:
        form = CommentForm()

    return render(request, 'comments/add_comment.html', {
        'form': form,
        'project': project,
        'parent_comment': parent_comment
    })

# Report a comment as inappropriate
@login_required
def report_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)

    if request.method == 'POST':
        form = CommentReportForm(request.POST)
        if form.is_valid():
            report = form.save(commit=False)
            report.user = request.user
            report.comment = comment
            report.save()
            return redirect('projects:project-detail', pk=comment.project.id)
    else:
        form = CommentReportForm()

    return render(request, 'comments/report_comment.html', {
        'form': form,
        'comment': comment
    })