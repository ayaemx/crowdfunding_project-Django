from django.contrib import admin
from .models import Project, ProjectPicture

admin.site.register(Project)
admin.site.register(ProjectPicture)
#@admin.register(Project)