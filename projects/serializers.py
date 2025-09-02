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
    """FIXED: Lightweight serializer for project lists with TAGS"""
    category = serializers.SerializerMethodField()
    pictures = serializers.SerializerMethodField()
    total_donations = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    donations_count = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()  # ADDED: Missing tags field

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'details', 'category', 'pictures', 'tags',  # ADDED: tags
            'total_target', 'total_donations', 'average_rating',
            'donations_count', 'is_featured', 'user',
            'start_time', 'end_time', 'created_at'
        ]

    def get_category(self, obj):
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name, 'slug': obj.category.slug}
        return None

    def get_pictures(self, obj):
        pictures = obj.pictures.all().order_by('order')
        return [{
            'id': pic.id,
            'image': self.context['request'].build_absolute_uri(pic.image.url) if pic.image else None,
            'is_main': pic.is_main,
            'order': pic.order
        } for pic in pictures]

    def get_total_donations(self, obj):
        return getattr(obj, 'total_donations', 0) or 0

    def get_average_rating(self, obj):
        rating = getattr(obj, 'average_rating', None)
        if rating:
            return round(rating, 1)
        avg = obj.ratings.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else 0

    def get_donations_count(self, obj):
        return getattr(obj, 'donations_count', obj.donations.count())

    def get_user(self, obj):
        if obj.owner:
            return {
                'id': obj.owner.id,
                'first_name': obj.owner.first_name,
                'last_name': obj.owner.last_name,
                'profile_picture': self.context['request'].build_absolute_uri(
                    obj.owner.profile_picture.url) if obj.owner.profile_picture else None
            }
        return None

    def get_tags(self, obj):
        """FIXED: Include tags in ALL project lists"""
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]


# Rest of your serializers remain the same...
class PersonalizedRecommendationSerializer(serializers.ModelSerializer):
    """Enhanced serializer for personalized recommendations"""
    category = serializers.SerializerMethodField()
    pictures = serializers.SerializerMethodField()
    total_donations = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    donations_count = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    recommendation_reason = serializers.SerializerMethodField()
    urgency_score = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'details', 'category', 'pictures', 'tags',
            'total_target', 'total_donations', 'average_rating',
            'donations_count', 'is_featured', 'user',
            'start_time', 'end_time', 'created_at',
            'recommendation_reason', 'urgency_score'
        ]

    def get_category(self, obj):
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name, 'slug': obj.category.slug}
        return None

    def get_pictures(self, obj):
        pictures = obj.pictures.all().order_by('order')
        return [{
            'id': pic.id,
            'image': self.context['request'].build_absolute_uri(pic.image.url) if pic.image else None,
            'is_main': pic.is_main,
            'order': pic.order
        } for pic in pictures]

    def get_total_donations(self, obj):
        return getattr(obj, 'total_donations', 0) or 0

    def get_average_rating(self, obj):
        rating = getattr(obj, 'average_rating', None)
        if rating:
            return round(rating, 1)
        return 0

    def get_donations_count(self, obj):
        return getattr(obj, 'donations_count', obj.donations.count())

    def get_user(self, obj):
        if obj.owner:
            return {
                'id': obj.owner.id,
                'first_name': obj.owner.first_name,
                'last_name': obj.owner.last_name,
                'profile_picture': self.context['request'].build_absolute_uri(
                    obj.owner.profile_picture.url) if obj.owner.profile_picture else None
            }
        return None

    def get_tags(self, obj):
        """Include tags in recommendations"""
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def get_recommendation_reason(self, obj):
        """Explain why this project was recommended"""
        request = self.context.get('request')
        if not request:
            return "Popular project"

        activity = request.session.get('user_activity', {})
        viewed_projects = activity.get('viewed_projects', [])
        category_interests = activity.get('category_interests', {})

        if obj.category and obj.category.slug in category_interests:
            return f"Based on your interest in {obj.category.name}"
        elif viewed_projects:
            return "Similar to projects you've viewed"
        else:
            return "Trending project"

    def get_urgency_score(self, obj):
        """Calculate urgency based on time remaining and funding gap"""
        from django.utils import timezone

        if not obj.end_time:
            return 0

        days_remaining = (obj.end_time - timezone.now()).days
        funding_percentage = (getattr(obj, 'total_donations', 0) or 0) / obj.total_target * 100

        if days_remaining < 7 and funding_percentage < 80:
            return 9
        elif days_remaining < 14 or funding_percentage < 50:
            return 6
        else:
            return 3


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
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name, 'slug': obj.category.slug}
        return None

    def get_tags(self, obj):
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def get_user(self, obj):
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
        return getattr(obj, 'total_donations', 0) or 0

    def get_average_rating(self, obj):
        rating = getattr(obj, 'average_rating', None)
        if rating:
            return round(rating, 1)
        avg = obj.ratings.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else 0

    def get_donations_count(self, obj):
        return getattr(obj, 'donations_count', obj.donations.count())

    def get_ratings_count(self, obj):
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
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        return value.strip()

    def validate_details(self, value):
        if len(value.strip()) < 100:
            raise serializers.ValidationError("Description must be at least 100 characters long.")
        return value.strip()

    def validate_total_target(self, value):
        if value < 100:
            raise serializers.ValidationError("Minimum funding goal is 100 EGP.")
        return value

    def validate(self, attrs):
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        if start_time and end_time:
            if end_time <= start_time:
                raise serializers.ValidationError({
                    'end_time': 'End date must be after start date.'
                })

            duration = end_time - start_time
            if duration.days < 7:
                raise serializers.ValidationError({
                    'end_time': 'Campaign must run for at least 7 days.'
                })

        return attrs

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
