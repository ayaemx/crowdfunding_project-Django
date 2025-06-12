# home/api_urls.py - NEW FILE FOR HOME API ENDPOINTS
from django.urls import path
from . import api_views

urlpatterns = [
    # Homepage data for React
    path('homepage/', api_views.homepage_data_api, name='homepage-data'),

    # Search functionality for React
    path('search/', api_views.search_projects_api, name='search-projects'),
]
