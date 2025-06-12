# categories/api_urls.py - COMPLETE FIXED VERSION
from django.urls import path
from . import api_views

urlpatterns = [
    # *** SPECIFIC ENDPOINTS FIRST ***
    path('popular/', api_views.popular_categories_api),  # /api/categories/popular/
    path('with-projects/', api_views.categories_with_projects_api),  # /api/categories/with-projects/

    # *** GENERAL CRUD ***
    path('', api_views.CategoryListCreateAPI.as_view()),  # /api/categories/

    # *** DYNAMIC PATTERNS LAST ***
    path('<slug:slug>/projects/', api_views.CategoryProjectsAPI.as_view()),  # /api/categories/{slug}/projects/
    path('<slug:slug>/', api_views.CategoryDetailAPI.as_view()),  # /api/categories/{slug}/
]

