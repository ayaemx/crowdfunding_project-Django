from django.urls import path
from . import views
from .views import CategoryListAPI
app_name = 'categories'

urlpatterns = [
    path('', views.category_list, name='category_list'),
    path('<slug:slug>/', views.category_detail, name='category_detail'),
    path('api/', CategoryListAPI.as_view(), name='category_list_api'),
]