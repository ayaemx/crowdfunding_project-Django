from django.urls import path
from .views import TagListView, CreateTagView, SearchByTagView, ProjectsByTagView

urlpatterns = [
    path('', TagListView.as_view(), name='api-tag-list'),
    path('create/', CreateTagView.as_view(), name='api-create-tag'),
    path('search/', SearchByTagView.as_view(), name='api-search-by-tag'),
    path('<str:tag_name>/', ProjectsByTagView.as_view(), name='api-projects-by-tag'),
]