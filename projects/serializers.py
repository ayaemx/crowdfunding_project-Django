from rest_framework import serializers
from django.db.models import Avg, Sum, Count
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
        fields = ['id', 'donor', 'user_name', 'amount', 'donation_date']
        read_only_fields = ['donor', 'donation_date']

    def get_user_name(self, obj):
        """Get donor name"""
        return f"{obj.donor.first_name} {obj.donor.last_name}" if obj.donor.first_name else obj.donor.username


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for project ratings"""
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'user_name', 'rating', 'created_at']
        read_only_fields = ['user', 'created_at']


class ProjectReportSerializer(serializers.ModelSerializer):
    """Serializer for reporting projects"""

    class Meta:
        model = ProjectReport
        fields = ['project', 'reporter', 'report_type', 'description']


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project lists (homepage, search, etc.)"""
    category = serializers.SerializerMethodField()
    pictures = serializers.SerializerMethodField()
    total_donations = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    donations_count = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'details', 'category', 'pictures',
            'total_target', 'total_donations', 'average_rating',
            'donations_count', 'is_featured', 'user',
            'start_time', 'end_time', 'created_at'
        ]

    def get_category(self, obj):
        """Get category details"""
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name, 'slug': obj.category.slug}
        return None

    def get_pictures(self, obj):
        """Get project pictures"""
        pictures = obj.pictures.all().order_by('order')
        return [
            {
                'id': pic.id,
                'image': self.context['request'].build_absolute_uri(pic.image.url) if pic.image else None,
                'is_main': pic.is_main,
                'order': pic.order
            }
            for pic in pictures
        ]

    def get_total_donations(self, obj):
        """Get total donations amount"""
        return getattr(obj, 'total_donations', 0) or 0  # Use annotation if available

    def get_average_rating(self, obj):
        """Get average rating"""
        rating = getattr(obj, 'average_rating', None)
        if rating:
            return round(rating, 1)
        # Fallback calculation
        avg = obj.ratings.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else 0

    def get_donations_count(self, obj):
        """Get donations count"""
        return getattr(obj, 'donations_count', obj.donations.count())

    def get_user(self, obj):
        """Get project owner info"""
        if obj.owner:
            return {
                'id': obj.owner.id,
                'first_name': obj.owner.first_name,
                'last_name': obj.owner.last_name,
                'profile_picture': self.context['request'].build_absolute_uri(
                    obj.owner.profile_picture.url) if obj.owner.profile_picture else None
            }
        return None


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single project view"""
    pictures = ProjectPictureSerializer(many=True, read_only=True)
    category = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    donations = DonationSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()

    # Calculated fields
    total_donations = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    donations_count = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_category(self, obj):
        """Get category details"""
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name, 'slug': obj.category.slug}
        return None

    def get_tags(self, obj):
        """Get tag details"""
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def get_user(self, obj):
        """Get project owner info"""
        if obj.owner:
            return {
                'id': obj.owner.id,
                'first_name': obj.owner.first_name,
                'last_name': obj.owner.last_name,
                'profile_picture': self.context['request'].build_absolute_uri(
                    obj.owner.profile_picture.url) if obj.owner.profile_picture else None
            }
        return None

    def get_total_donations(self, obj):
        """Get total donations amount"""
        return getattr(obj, 'total_donations', 0) or 0

    def get_average_rating(self, obj):
        """Get average rating"""
        rating = getattr(obj, 'average_rating', None)
        if rating:
            return round(rating, 1)
        avg = obj.ratings.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else 0

    def get_donations_count(self, obj):
        """Get donations count"""
        return getattr(obj, 'donations_count', obj.donations.count())

    def get_ratings_count(self, obj):
        """Get ratings count"""
        return obj.ratings.count()


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects"""

    class Meta:
        model = Project
        fields = [
            'title', 'details', 'category', 'total_target', 'currency',
            'start_time', 'end_time', 'is_featured'
        ]

    def validate_title(self, value):
        """Validate project title"""
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        return value.strip()

    def validate_details(self, value):
        """Validate project description"""
        if len(value.strip()) < 100:
            raise serializers.ValidationError("Description must be at least 100 characters long.")
        return value.strip()

    def validate_total_target(self, value):
        """Validate funding goal"""
        if value < 100:
            raise serializers.ValidationError("Minimum funding goal is 100 EGP.")
        return value

    def validate(self, attrs):
        """Validate start and end times"""
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        if start_time and end_time:
            if end_time <= start_time:
                raise serializers.ValidationError({
                    'end_time': 'End date must be after start date.'
                })

            # Check minimum 7 days duration
            duration = end_time - start_time
            if duration.days < 7:
                raise serializers.ValidationError({
                    'end_time': 'Campaign must run for at least 7 days.'
                })

        return attrs

    def create(self, validated_data):
        """Auto-set owner from request context"""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
