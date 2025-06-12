# categories/urls.py - FIXED URL NAMES
from django.urls import path
from . import views

app_name = 'categories'

urlpatterns = [
    path('', views.category_list, name='category_list'),  # ← Match template URL name
    path('<slug:slug>/', views.category_detail, name='category_detail'),  # ← Match template URL name
]
