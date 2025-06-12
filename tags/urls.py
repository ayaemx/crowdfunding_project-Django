# tags/urls.py - FIXED SYNTAX ERRORS
from django.urls import path
from tags import views

app_name = 'tags'  # *** NEW: Added app_name for namespace ***

urlpatterns = [
    # Template views for testing
    path('', views.tag_list, name='tag_list'),
    path('search/', views.search_by_tag, name='search_by_tag'),
    path('<str:tag_name>/', views.projects_by_tag, name='projects_by_tag'),  # *** FIXED: Added closing quote ***
    path('similar/<int:project_id>/', views.similar_projects, name='similar_projects'),
]
