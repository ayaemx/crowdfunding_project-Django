from django import forms
from .models import Project, ProjectPicture

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['title', 'details', 'category', 'total_target', 'currency', 'tags', 'start_time', 'end_time']

class ProjectPictureForm(forms.ModelForm):
    class Meta:
        model = ProjectPicture
        fields = ['image']
