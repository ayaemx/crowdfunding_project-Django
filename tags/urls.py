from django.urls import path
from tags import views

urlpatterns = [
    # Specific routes first
    path('search/', views.search_by_tag, name='search_by_tag'),  # ← Moved up

    # General routes after
    path('', views.tag_list, name='tag_list'),
    path('<str:tag_name>/', views.projects_by_tag, name='projects_by_tag'),
]