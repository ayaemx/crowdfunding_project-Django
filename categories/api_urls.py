# categories/api_urls.py - FIXED SYNTAX

from django.urls import path
from . import api_views

urlpatterns = [
    # *** SPECIFIC ENDPOINTS FIRST ***
    path('popular/', api_views.popular_categories_api, name='popular-categories'),
    path('with-projects/', api_views.categories_with_projects_api, name='categories-with-projects'),

    # *** GENERAL CRUD ***
    path('', api_views.CategoryListCreateAPI.as_view(), name='category-list-create'),

    # *** DYNAMIC PATTERNS LAST ***
    path('<slug:slug>/projects/', api_views.CategoryProjectsAPI.as_view(), name='category-projects'),
    # FIXED: Added <slug:slug>
    path('<slug:slug>/', api_views.CategoryDetailAPI.as_view(), name='category-detail'),  # FIXED: Added <slug:slug>
]
