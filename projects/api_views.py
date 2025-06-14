from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser  # ADD JSONParser
from django.db.models import Q, Avg, Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Project, Donation, Rating, ProjectReport, ProjectPicture
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer,
    ProjectCreateUpdateSerializer, DonationSerializer,
    RatingSerializer, ProjectReportSerializer
)
from tags.models import Tag
from categories.models import Category


class ProjectViewSet(viewsets.ModelViewSet):
    """Complete project management viewset"""
    # FIXED: Add JSONParser to handle JSON requests from React
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        # SIMPLIFIED: Show all active projects without time restrictions
        queryset = Project.objects.select_related('category', 'owner').prefetch_related(
            'pictures', 'tags', 'donations', 'ratings'
        ).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating'),
            donations_count=Count('donations')
        ).filter(is_active=True)  # Only filter by is_active

        # Apply search filters
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        title = self.request.query_params.get('title')
        tags = self.request.query_params.get('tags')
        min_target = self.request.query_params.get('min_target')
        max_target = self.request.query_params.get('max_target')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(details__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()

        if title:
            queryset = queryset.filter(title__icontains=title)

        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            queryset = queryset.filter(tags__name__in=tag_list).distinct()

        if category:
            try:
                category_obj = Category.objects.get(slug=category)
                queryset = queryset.filter(category=category_obj)
            except Category.DoesNotExist:
                pass

        if min_target:
            queryset = queryset.filter(total_target__gte=min_target)

        if max_target:
            queryset = queryset.filter(total_target__lte=max_target)

        return queryset

    def create(self, request, *args, **kwargs):
        """Enhanced project creation with images and tags handling"""
        try:
            # Extract basic project data
            project_data = {
                'title': request.data.get('title'),
                'details': request.data.get('details'),
                'category': request.data.get('category'),
                'total_target': request.data.get('total_target'),
                'start_time': request.data.get('start_time'),
                'end_time': request.data.get('end_time'),
                'is_featured': request.data.get('is_featured', False)
            }

            # Create project first
            serializer = ProjectCreateUpdateSerializer(data=project_data, context={'request': request})
            if serializer.is_valid():
                project = serializer.save()

                # Handle tags - extract from tags[0], tags[1], etc.
                tags_data = []
                for key in request.data.keys():
                    if key.startswith('tags[') and key.endswith(']'):
                        tags_data.append(request.data[key])

                # Create or get tags and add to project
                for tag_name in tags_data:
                    tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                    project.tags.add(tag)

                # Handle images - extract from image_0, image_1, etc.
                images = []
                for key in request.FILES.keys():
                    if key.startswith('image_'):
                        images.append(request.FILES[key])

                # Create project pictures
                for index, image in enumerate(images):
                    picture = ProjectPicture.objects.create(
                        image=image,
                        is_main=(index == 0),  # First image is main
                        order=index
                    )
                    project.pictures.add(picture)

                # Return created project with full details
                response_serializer = ProjectDetailSerializer(project, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {'error': f'Project creation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def donate(self, request, pk=None):
        """Handle project donations - FIXED: Now accepts JSON"""
        project = self.get_object()
        amount = request.data.get('amount')

        print(f"Donation request data: {request.data}")  # Debug logging
        print(f"Content type: {request.content_type}")  # Debug logging

        if not amount:
            return Response(
                {'error': 'Donation amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)
            if amount <= 0:
                return Response(
                    {'error': 'Donation amount must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid donation amount'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if campaign is still active
        if project.end_time < timezone.now():
            return Response(
                {'error': 'Campaign has ended'},
                status=status.HTTP_400_BAD_REQUEST
            )

        donation = Donation.objects.create(
            project=project,
            donor=request.user,
            amount=amount
        )

        serializer = DonationSerializer(donation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Handle project ratings - FIXED: Now accepts JSON"""
        project = self.get_object()
        rating_value = request.data.get('rating')

        print(f"Rating request data: {request.data}")  # Debug logging
        print(f"Content type: {request.content_type}")  # Debug logging

        if not rating_value:
            return Response(
                {'error': 'Rating is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating_value = int(rating_value)
            if not (1 <= rating_value <= 5):
                return Response(
                    {'error': 'Rating must be between 1 and 5'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid rating value'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating, created = Rating.objects.update_or_create(
            project=project,
            user=request.user,
            defaults={'rating': rating_value}
        )

        serializer = RatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel project if less than 25% funded (PDF requirement)"""
        project = self.get_object()

        if project.owner != request.user:
            return Response(
                {'error': 'Only project owner can cancel'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if less than 25% funded
        total_donations = project.donations.aggregate(
            total=Sum('amount')
        )['total'] or 0

        progress_percentage = (total_donations / project.total_target) * 100

        if progress_percentage >= 25:
            return Response(
                {'error': 'Cannot cancel project with 25% or more funding'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', '')
        project.is_active = False
        project.save()

        return Response({'message': 'Project cancelled successfully'})

    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        """Report inappropriate project - FIXED field mapping"""
        project = self.get_object()

        # Debug logging
        print(f"Report request data: {request.data}")
        print(f"Project ID: {pk}")
        print(f"User: {request.user}")

        # FIXED: Use correct field names that match your ReportModal.js
        report_type = request.data.get('report_type')  # Changed from 'type' to 'report_type'
        description = request.data.get('description')

        if not report_type:
            return Response(
                {'error': 'Report type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not description:
            return Response(
                {'error': 'Description is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already reported this project
        try:
            existing_report = ProjectReport.objects.filter(
                project=project,
                reporter=request.user
            ).first()

            if existing_report:
                return Response(
                    {'error': 'You have already reported this project'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the report with correct field mapping
            report = ProjectReport.objects.create(
                project=project,
                reporter=request.user,
                report_type=report_type,  # This matches your model field
                description=description
            )

            return Response({
                'message': 'Report submitted successfully',
                'report_id': report.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error creating report: {e}")
            return Response(
                {'error': 'Failed to submit report'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar projects based on tags (PDF requirement: 4 similar projects)"""
        project = self.get_object()

        # Get projects with similar tags
        similar_projects = Project.objects.filter(
            tags__in=project.tags.all(),
            is_active=True
        ).exclude(id=project.id).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating')
        ).distinct()[:4]

        serializer = ProjectListSerializer(similar_projects, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def homepage_data(self, request):
        """Get homepage data (PDF requirements: top 5 rated, latest 5, featured 5)"""
        # SIMPLIFIED: Remove time restrictions to show all projects

        # Top 5 rated projects
        top_rated = Project.objects.filter(
            is_active=True
        ).annotate(
            average_rating=Avg('ratings__rating'),
            total_donations=Sum('donations__amount')
        ).filter(average_rating__isnull=False).order_by('-average_rating')[:5]

        # Latest 5 projects
        latest = Project.objects.filter(
            is_active=True
        ).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating')
        ).order_by('-created_at')[:5]

        # Featured 5 projects (selected by admin)
        featured = Project.objects.filter(
            is_featured=True,
            is_active=True
        ).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating')
        ).order_by('-created_at')[:5]

        return Response({
            'top_rated': ProjectListSerializer(top_rated, many=True, context={'request': request}).data,
            'latest': ProjectListSerializer(latest, many=True, context={'request': request}).data,
            'featured': ProjectListSerializer(featured, many=True, context={'request': request}).data,
        })
