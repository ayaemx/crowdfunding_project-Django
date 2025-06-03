from django.urls import path
from .views import AddCommentView, ReplyCommentView, ReportCommentView

urlpatterns = [
    path('project/<int:pk>/add/', AddCommentView.as_view(), name='api-add-comment'),
    path('comment/<int:comment_id>/reply/', ReplyCommentView.as_view(), name='api-reply-comment'),
    path('comment/<int:comment_id>/report/', ReportCommentView.as_view(), name='api-report-comment'),
]