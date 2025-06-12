# projects/api_views.py - COMPLETE FIXED VERSION
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes  # *** FIXED: Added missing imports ***
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Avg
from django.db import models
from django.utils import timezone
from .models import Project, Donation, Rating, ProjectReport, ProjectPicture
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer,
    ProjectCreateUpdateSerializer, DonationSerializer,
    RatingSerializer, ProjectReportSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    """Complete project API with all crowdfunding functionality"""
    queryset = Project.objects.all().select_related('category', 'owner').prefetch_related(
        'tags', 'pictures', 'donations', 'ratings'
    )
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_serializer_class(self):
        """Dynamic serializer selection based on action"""
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectCreateUpdateSerializer

    def get_queryset(self):
        """Enhanced filtering and search functionality"""
        queryset = self.queryset

        # Search functionality (PDF requirement)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()

        # Category filtering
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)

        # Featured projects filtering
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        return queryset.filter(is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        """Set project owner to current user"""
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def homepage_data(self, request):
        """Get data for homepage - top rated, latest, featured projects"""
        try:
            # Top 5 highest rated projects
            top_rated = Project.objects.annotate(
                avg_rating=models.Avg('ratings__rating')
            ).filter(
                avg_rating__isnull=False,
                is_active=True
            ).order_by('-avg_rating')[:5]

            # Latest 5 projects
            latest = Project.objects.filter(is_active=True).order_by('-created_at')[:5]

            # Featured projects (admin selected)
            featured = Project.objects.filter(is_featured=True, is_active=True)[:5]

            serializer_class = ProjectListSerializer
            return Response({
                'top_rated': serializer_class(top_rated, many=True, context={'request': request}).data,
                'latest': serializer_class(latest, many=True, context={'request': request}).data,
                'featured': serializer_class(featured, many=True, context={'request': request}).data,
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch homepage data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def donate(self, request, pk=None):
        """Donate to a project"""
        try:
            project = self.get_object()

            # Check if project is active and running
            if not project.is_active:
                return Response(
                    {'error': 'Cannot donate to inactive project'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = DonationSerializer(data=request.data, context={'request': request})

            if serializer.is_valid():
                serializer.save(user=request.user, project=project)

                # Return updated project data
                project_serializer = ProjectDetailSerializer(project, context={'request': request})
                return Response({
                    'donation': serializer.data,
                    'project': project_serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {'error': f'Donation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        """Rate a project (1-5 stars)"""
        try:
            project = self.get_object()

            # Check if user is not the project owner
            if project.owner == request.user:
                return Response(
                    {'error': 'Cannot rate your own project'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if user already rated this project
            existing_rating = Rating.objects.filter(user=request.user, project=project).first()

            if existing_rating:
                # Update existing rating
                serializer = RatingSerializer(existing_rating, data=request.data, context={'request': request})
            else:
                # Create new rating
                serializer = RatingSerializer(data=request.data, context={'request': request})

            if serializer.is_valid():
                serializer.save(user=request.user, project=project)

                # Return updated project data with new average rating
                return Response({
                    'rating': serializer.data,
                    'project_average_rating': project.average_rating,
                    'project_total_ratings': project.total_ratings
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {'error': f'Rating failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, pk=None):
        """Report inappropriate project"""
        try:
            project = self.get_object()

            # Check if user is not the project owner
            if project.owner == request.user:
                return Response(
                    {'error': 'Cannot report your own project'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if user already reported this project
            existing_report = ProjectReport.objects.filter(user=request.user, project=project).first()
            if existing_report:
                return Response(
                    {'error': 'You have already reported this project'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = ProjectReportSerializer(data=request.data, context={'request': request})

            if serializer.is_valid():
                serializer.save(project=project)
                return Response(
                    {'message': 'Project reported successfully. Our team will review it.'},
                    status=status.HTTP_201_CREATED
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {'error': f'Report failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated],
            parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """Upload multiple images to a project (main + additional)"""
        try:
            project = self.get_object()

            # Check if user is project owner
            if project.owner != request.user:
                return Response(
                    {'error': 'Only project owner can upload images'},
                    status=status.HTTP_403_FORBIDDEN
                )

            images = request.FILES.getlist('images')
            if not images:
                return Response(
                    {'error': 'No images provided. Please select at least one image.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Minimum 3 images required (1 main + 2 additional) as per requirements
            if len(images) < 3:
                return Response(
                    {'error': 'Minimum 3 images required (1 main + 2 additional)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            created_images = []
            for index, image in enumerate(images):
                # First image becomes main picture
                is_main = index == 0
                picture = ProjectPicture.objects.create(
                    image=image,
                    is_main=is_main,
                    order=index
                )
                project.pictures.add(picture)
                created_images.append({
                    'id': picture.id,
                    'image': request.build_absolute_uri(picture.image.url),
                    'is_main': is_main,
                    'order': index,
                    'uploaded_at': picture.uploaded_at
                })

            return Response({
                'message': f'Successfully uploaded {len(created_images)} images',
                'uploaded_images': created_images
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Image upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """Cancel project if <25% funded (PDF requirement)"""
        try:
            project = self.get_object()

            # Check if user is project owner
            if project.owner != request.user:
                return Response(
                    {'error': 'Only project owner can cancel the project'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if project can be cancelled (less than 25% funded)
            if not project.can_be_cancelled:
                return Response({
                    'error': f'Project cannot be cancelled. Current funding: {project.funding_percentage:.1f}%. ' +
                             'Projects can only be cancelled if less than 25% funded.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Cancel the project
            project.is_active = False
            project.save()

            return Response({
                'message': 'Project cancelled successfully',
                'funding_percentage': project.funding_percentage,
                'total_raised': project.current_amount
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Project cancellation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def similar(self, request, pk=None):
        """Get similar projects based on tags (PDF requirement)"""
        try:
            project = self.get_object()

            if not project.tags.exists():
                return Response({
                    'similar_projects': [],
                    'count': 0,
                    'message': 'No tags found for this project'
                })

            # Get projects that share tags with current project
            similar_projects = Project.objects.filter(
                tags__in=project.tags.all(),
                is_active=True
            ).exclude(id=project.id).distinct()[:4]  # PDF requires 4 similar projects

            serializer = ProjectListSerializer(similar_projects, many=True, context={'request': request})
            return Response({
                'similar_projects': serializer.data,
                'count': similar_projects.count(),
                'project_tags': [tag.name for tag in project.tags.all()]
            })

        except Exception as e:
            return Response({
                'error': f'Failed to fetch similar projects: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def stats(self, request, pk=None):
        """Get project statistics"""
        try:
            project = self.get_object()

            return Response({
                'total_donations': project.donations.count(),
                'total_donors': project.donations.values('user').distinct().count(),
                'current_amount': project.current_amount,
                'funding_percentage': project.funding_percentage,
                'average_rating': project.average_rating,
                'total_ratings': project.total_ratings,
                'days_remaining': (project.end_time - timezone.now()).days if project.end_time > timezone.now() else 0,
                'is_running': project.is_running,
                'can_be_cancelled': project.can_be_cancelled
            })

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch project statistics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
