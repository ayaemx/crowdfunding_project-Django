class ProjectPictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPicture
        fields = ['id', 'image', 'uploaded_at']


class ProjectSerializer(serializers.ModelSerializer):
    pictures = ProjectPictureSerializer(many=True, read_only=True)
    current_amount = serializers.SerializerMethodField()
    funding_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_current_amount(self, obj):
        return obj.current_amount

    def get_funding_percentage(self, obj):
        return obj.funding_percentage
