from rest_framework import serializers
from ..models import Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate(self, data):
        # Prevent duplicate tag names per user
        user = self.context['request'].user
        name = data['name']
        if Tag.objects.filter(name=name, user=user).exists():
            raise serializers.ValidationError("You already have a tag with this name.")
        return data