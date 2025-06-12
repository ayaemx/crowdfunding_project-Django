# tags/api_urls.py - ENSURE CORRECT ORDER
from django.urls import path
from . import api_views

urlpatterns = [
    # *** SPECIFIC ENDPOINTS FIRST ***
    path('popular/', api_views.popular_tags_api, name='popular-tags'),
    path('search/', api_views.search_tags_api, name='search-tags'),

    # *** GENERAL CRUD ***
    path('', api_views.TagListCreateAPI.as_view(), name='tag-list-create'),

    # *** DYNAMIC PATTERNS LAST ***
    path('<slug:slug>/projects/', api_views.tag_projects_api, name='tag-projects'),
    path('<slug:slug>/', api_views.TagDetailAPI.as_view(), name='tag-detail'),
]
