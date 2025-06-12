# tags/api_urls.py - FIXED VERSION (SIMPLIFIED)
from django.urls import path
from . import api_views

urlpatterns = [
    # Tag CRUD operations
    path('', api_views.TagListCreateAPI.as_view(), name='tag-list-create'),
    path('<slug:slug>/', api_views.TagDetailAPI.as_view(), name='tag-detail'),

    # Tag data endpoints
    path('popular/', api_views.popular_tags_api, name='popular-tags'),
    path('search/', api_views.search_tags_api, name='search-tags'),

    # Project-tag relationships
    path('<slug:tag_slug>/projects/', api_views.tag_projects_api, name='tag-projects'),

    # *** REMOVED: Problematic line that was causing the error ***
    # path('similar/<int:project_id>/', api_views.similar_projects_by_tags_api, name='similar-projects-by-tags'),
]
