# comments/views.py - FIXED DUPLICATE FUNCTION
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from projects.models import Project
from .models import Comment, HiddenComment
from .forms import CommentForm, CommentReportForm
from django.contrib import messages


@login_required
def add_comment(request, pk):
    """Add a main comment to a project"""
    project = get_object_or_404(Project, id=pk)

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.project = project
            comment.user = request.user
            comment.save()
            messages.success(request, "Comment added successfully!")
            return redirect('projects:project-detail', pk=project.id)
    else:
        form = CommentForm()

    return render(request, 'comments/add_comment.html', {
        'form': form,
        'project': project
    })


@login_required
def reply_comment(request, comment_id):
    """Reply to an existing comment"""
    parent_comment = get_object_or_404(Comment, id=comment_id)
    project = parent_comment.project

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            reply = form.save(commit=False)
            reply.project = project
            reply.user = request.user
            reply.parent = parent_comment
            reply.save()
            messages.success(request, "Reply added successfully!")
            return redirect('projects:project-detail', pk=project.id)
    else:
        form = CommentForm()

    return render(request, 'comments/add_comment.html', {
        'form': form,
        'project': project,
        'parent_comment': parent_comment
    })


@login_required
def report_comment(request, comment_id):
    """Report a comment as inappropriate"""
    comment = get_object_or_404(Comment, id=comment_id)

    if request.method == 'POST':
        form = CommentReportForm(request.POST)
        if form.is_valid():
            report = form.save(commit=False)
            report.user = request.user
            report.comment = comment
            report.save()

            # Hide the comment from the reporting user
            HiddenComment.objects.get_or_create(user=request.user, comment=comment)

            messages.success(request, "Thank you for reporting. You won't see this comment anymore.")
            return redirect('projects:project-detail', pk=comment.project.id)
        else:
            messages.error(request, "Please provide a reason for reporting.")
    else:
        form = CommentReportForm()

    return render(request, 'comments/report_comment.html', {
        'form': form,
        'comment': comment
    })
