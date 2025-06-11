# comments/api_urls.py - FIXED VERSION
from django.urls import path
from . import api_views

urlpatterns = [
    # Get/Create comments for a project
    path('project/<int:project_id>/', api_views.ProjectCommentsAPI.as_view(), name='project-comments'),

    # Comment actions
    path('comment/<int:comment_id>/report/', api_views.report_comment_api, name='report-comment-api'),

    # *** REMOVED: CommentRepliesAPI reference that was causing the error ***
    # path('comment/<int:comment_id>/replies/', api_views.CommentRepliesAPI.as_view(), name='comment-replies'),
]
