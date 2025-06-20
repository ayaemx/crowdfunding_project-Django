# home/urls.py - COMPLETE URL CONFIGURATION
from django.urls import path
from . import views

app_name = 'home'

urlpatterns = [
    path('', views.home_view, name='home'),
    path('search/', views.search_view, name='search'),
    path('about/', views.about_view, name='about'),
]
