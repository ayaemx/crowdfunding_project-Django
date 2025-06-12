# categories/views.py - FIXED WITH MISSING IMPORTS
from django.shortcuts import render, get_object_or_404
from django.db.models import Count, Q
from django.db import models  # *** ADD THIS MISSING IMPORT ***
from .models import Category


def category_list(request):
    """List all categories with project counts"""
    print("=== CATEGORY LIST DEBUG ===")

    # Get categories with project counts
    categories = Category.objects.annotate(
        projects_count=Count('projects', filter=Q(projects__is_active=True))
    ).order_by('name')

    print(f"DEBUG: Found {categories.count()} categories")
    for cat in categories:
        print(f"- {cat.name}: {getattr(cat, 'projects_count', 0)} projects")

    context = {
        'categories': categories,
    }

    print(f"Context being passed: {context}")
    return render(request, 'categories/category_list.html', context)


def category_detail(request, slug):
    """Show projects in a category"""
    category = get_object_or_404(Category, slug=slug)
    projects = category.projects.filter(is_active=True)

    context = {
        'category': category,
        'projects': projects,
    }

    return render(request, 'categories/category_detail.html', context)
