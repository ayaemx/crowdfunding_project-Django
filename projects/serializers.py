from rest_framework import serializers
from .models import Project, ProjectPicture

class ProjectPictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPicture
        fields = ['id', 'image', 'uploaded_at']

class ProjectSerializer(serializers.ModelSerializer):
    pictures = ProjectPictureSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = '__all__'
