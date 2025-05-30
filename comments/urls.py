from django.urls import path
from . import views

app_name = 'comments'  # ← This line defines the namespace

urlpatterns = [
    # URL to add a new comment to a project
    path('project/<int:pk>/add/', views.add_comment, name='add_comment'),

    # URL to reply to an existing comment
    path('comment/<int:comment_id>/reply/', views.reply_comment, name='reply_comment'),

    # URL to report a comment
    path('comment/<int:comment_id>/report/', views.report_comment, name='report_comment'),
]