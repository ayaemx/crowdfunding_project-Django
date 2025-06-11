from rest_framework import serializers
from django.db.models import Avg
from .models import Project, ProjectPicture, Donation, Rating, ProjectReport


class ProjectPictureSerializer(serializers.ModelSerializer):
    """Serializer for project pictures with full URLs"""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectPicture
        fields = ['id', 'image', 'image_url', 'is_main', 'order', 'uploaded_at']

    def get_image_url(self, obj):
        """Get full image URL for React frontend"""
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None


class DonationSerializer(serializers.ModelSerializer):
    """Serializer for donations with user name display"""
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = ['id', 'user', 'user_name', 'amount', 'message', 'is_anonymous', 'donation_date']
        read_only_fields = ['user', 'donation_date']

    def get_user_name(self, obj):
        """Get donor name (or Anonymous for anonymous donations)"""
        if obj.is_anonymous:
            return "Anonymous Donor"
        return obj.user.get_full_name() or obj.user.username


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for project ratings"""
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'user_name', 'rating', 'review', 'created_at']
        read_only_fields = ['user', 'created_at']


class ProjectReportSerializer(serializers.ModelSerializer):
    """Serializer for reporting projects"""

    class Meta:
        model = ProjectReport
        fields = ['reason', 'details']

    def create(self, validated_data):
        """Auto-set user from request context"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project lists (homepage, search, etc.)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_picture = serializers.SerializerMethodField()
    current_amount = serializers.ReadOnlyField()  # *** FIXED: Real-time funding ***
    funding_percentage = serializers.ReadOnlyField()  # *** FIXED: Funding progress ***
    average_rating = serializers.ReadOnlyField()  # *** FIXED: Average rating ***
    total_ratings = serializers.ReadOnlyField()  # *** FIXED: Rating count ***
    is_running = serializers.ReadOnlyField()  # *** FIXED: Campaign status ***

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'details', 'category_name', 'main_picture',
            'total_target', 'currency', 'current_amount', 'funding_percentage',
            'average_rating', 'total_ratings', 'is_featured', 'is_running',
            'start_time', 'end_time', 'created_at'
        ]  # *** FIXED: Added missing closing bracket ***

    def get_main_picture(self, obj):
        """Get main picture URL for React frontend"""
        main_pic = obj.main_picture
        if main_pic:
            return self.context['request'].build_absolute_uri(main_pic.image.url)
        return None


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single project view"""
    pictures = ProjectPictureSerializer(many=True, read_only=True)  # *** FIXED: All pictures ***
    category = serializers.SerializerMethodField()  # *** FIXED: Category details ***
    tags = serializers.SerializerMethodField()  # *** FIXED: Tag details ***
    recent_donations = DonationSerializer(many=True, read_only=True,
                                          source='donations')  # *** FIXED: Recent donations ***
    ratings = RatingSerializer(many=True, read_only=True)  # *** FIXED: All ratings ***
    similar_projects = ProjectListSerializer(many=True, read_only=True)  # *** FIXED: Similar projects ***
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)  # *** FIXED: Owner name ***

    # *** FIXED: Calculated fields for React frontend ***
    current_amount = serializers.ReadOnlyField()
    funding_percentage = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    total_ratings = serializers.ReadOnlyField()
    can_be_cancelled = serializers.ReadOnlyField()
    is_running = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_category(self, obj):
        """Get category details"""
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name}
        return None

    def get_tags(self, obj):
        """Get tag details"""
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects"""

    class Meta:
        model = Project
        fields = [
            'title', 'details', 'category', 'total_target', 'currency',
            'tags', 'start_time', 'end_time'
        ]  # *** FIXED: Proper field list formatting ***

    def create(self, validated_data):
        """Auto-set owner from request context"""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
