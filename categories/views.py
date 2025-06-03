from django.shortcuts import render, get_object_or_404
from .models import Category
from projects.models import Project
from rest_framework import generics
from .models import Category
from .serializers import CategorySerializer

def category_list(request):
    categories = Category.objects.all().order_by('name')
    return render(request, 'categories/category_list.html', {'categories': categories})

def category_detail(request, slug):
    category = get_object_or_404(Category, slug=slug)
    projects = Project.objects.filter(category=category)
    return render(request, 'categories/category_detail.html', {
        'category': category,
        'projects': projects
    })
class CategoryListAPI(generics.ListAPIView):
        queryset = Category.objects.all().order_by('name')
        serializer_class = CategorySerializer