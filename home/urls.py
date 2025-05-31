# home/urls.py
from django.urls import path
from . import views

app_name = 'home'

urlpatterns = [
    path('', views.homepage, name='homepage'),

]











# from django.urls import path
# from . import views
#
# app_name = 'home'
#
# urlpatterns = [
#     path('', views.homepage, name='homepage'),
#     path('tags/<slug:tag_slug>/', views.tag_projects, name='tag_projects'),
#     # path('search/', views.search_projects, name='search_projects'),
# ]