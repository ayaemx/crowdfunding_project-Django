from django.urls import path
from .api_views import ProjectCommentsListCreateAPI, CommentReportAPI

urlpatterns = [
    # FIXED: Proper URL patterns with correct syntax
    path('project/<int:project_id>/', ProjectCommentsListCreateAPI.as_view(), name='project-comments'),
    path('comment/<int:comment_id>/report/', CommentReportAPI.as_view(), name='comment-report'),
]
