from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path('', views.project_list, name='project-list'),              # GET all projects
    path('add/', views.project_create, name='project-add'),         # create new project (GET form, POST submit)
    path('<int:pk>/', views.project_detail, name='project-detail'), # view single project
    path('<int:pk>/edit/', views.project_edit, name='project-edit'),# edit project
    path('<int:pk>/delete/', views.project_delete, name='project-delete'), # delete project
]
