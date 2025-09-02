from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Avg, Sum, Count, F
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
from decimal import Decimal, InvalidOperation
import decimal

from .models import Project, Donation, Rating, ProjectReport, ProjectPicture
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer,
    ProjectCreateUpdateSerializer, DonationSerializer,
    RatingSerializer, ProjectReportSerializer,
    PersonalizedRecommendationSerializer
)
from tags.models import Tag
from categories.models import Category


class ProjectViewSet(viewsets.ModelViewSet):
    """Complete project management viewset with enhanced personalization"""
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        elif self.action in ['personalized_dashboard', 'recommendations']:
            return PersonalizedRecommendationSerializer
        return ProjectDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Project.objects.select_related('category', 'owner').prefetch_related(
            'pictures', 'tags', 'donations', 'ratings'
        ).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating'),
            donations_count=Count('donations')
        ).filter(is_active=True)

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

            # Track search query in session
            activity = self.request.session.get('user_activity', {})
            search_queries = activity.get('search_queries', [])
            if search not in search_queries:
                search_queries.append(search)
                if len(search_queries) > 10:
                    search_queries = search_queries[-10:]
                activity['search_queries'] = search_queries
                self.request.session['user_activity'] = activity
                self.request.session.modified = True

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

    # NEW: Missing endpoints for dashboard functionality
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Get current user's projects"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        projects = Project.objects.filter(
            owner=request.user
        ).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating'),
            donations_count=Count('donations')
        ).order_by('-created_at')

        serializer = ProjectListSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_donations(self, request):
        """Get current user's donations"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        donations = Donation.objects.filter(
            donor=request.user
        ).select_related('project').order_by('-donation_date')

        # Add project title to each donation
        donation_data = []
        for donation in donations:
            donation_dict = DonationSerializer(donation, context={'request': request}).data
            donation_dict['project_title'] = donation.project.title
            donation_data.append(donation_dict)

        return Response(donation_data)

    @action(detail=True, methods=['post'])
    def cancel_project(self, request, pk=None):
        """Cancel a project (only if <25% funded)"""
        project = self.get_object()

        # Check if user is the owner
        if project.owner != request.user:
            return Response({'error': 'Only project owner can cancel'}, status=403)

        # Check funding percentage
        total_donations = project.donations.aggregate(total=Sum('amount'))['total'] or 0
        funding_percentage = (total_donations / project.total_target) * 100

        if funding_percentage >= 25:
            return Response({
                'error': f'Cannot cancel project with {funding_percentage:.1f}% funding (>25% threshold)'
            }, status=400)

        reason = request.data.get('reason', '')
        if not reason.strip():
            return Response({'error': 'Cancellation reason is required'}, status=400)

        # Cancel the project
        project.is_active = False
        project.cancellation_reason = reason
        project.save()

        return Response({'message': 'Project cancelled successfully'})

    @action(detail=True, methods=['post'])
    def report_project(self, request, pk=None):
        """Report a project"""
        project = self.get_object()

        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        report_data = {
            'project': project.id,
            'reporter': request.user.id,
            'report_type': request.data.get('report_type'),
            'description': request.data.get('description')
        }

        serializer = ProjectReportSerializer(data=report_data)
        if serializer.is_valid():
            serializer.save(project=project, reporter=request.user)
            return Response({'message': 'Report submitted successfully'})

        return Response(serializer.errors, status=400)

    # All your existing methods remain the same...
    def retrieve(self, request, pk=None):
        """Get a single project by ID - ENHANCED WITH DONATION VALIDATION"""
        try:
            project = get_object_or_404(Project, pk=pk, is_active=True)

            # Calculate remaining amount with proper type handling
            total_donations = project.donations.aggregate(total=Sum('amount'))['total'] or Decimal('0')
            remaining_amount = max(Decimal('0'), project.total_target - total_donations)

            serializer = ProjectDetailSerializer(project, context={'request': request})
            data = serializer.data

            # Add donation validation info
            data['remaining_amount'] = float(remaining_amount)
            data['is_fully_funded'] = remaining_amount <= 0
            data['funding_percentage'] = float(
                (total_donations / project.total_target * 100) if project.total_target > 0 else 0
            )

            return Response(data)
        except Project.DoesNotExist:
            available_projects = list(Project.objects.filter(is_active=True).values_list('id', flat=True))
            return Response({
                'error': 'Project not found',
                'message': f'No active project exists with ID {pk}',
                'available_project_ids': available_projects,
                'total_active_projects': len(available_projects)
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def donate(self, request, pk=None):
        """Handle project donations with validation"""
        project = self.get_object()
        amount = request.data.get('amount')

        if not amount:
            return Response(
                {'error': 'Donation amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = Decimal(str(amount))
            if amount <= 0:
                return Response(
                    {'error': 'Donation amount must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError, InvalidOperation):
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

        # Calculate remaining amount with proper type handling
        total_donations = project.donations.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        remaining_amount = project.total_target - total_donations

        response_data = {
            'donation_amount': float(amount),
            'remaining_amount': float(remaining_amount),
            'excess_amount': float(max(Decimal('0'), amount - remaining_amount)),
            'warning': None
        }

        # Add warning if donation exceeds remaining amount
        if amount > remaining_amount and remaining_amount > 0:
            response_data['warning'] = {
                'message': f'This campaign only needs {float(remaining_amount):.2f} EGP more to reach its goal. Your generous donation of {float(amount):.2f} EGP exceeds this by {float(amount - remaining_amount):.2f} EGP. The extra amount will help support other campaigns on our platform.',
                'remaining_needed': float(remaining_amount),
                'excess_amount': float(amount - remaining_amount)
            }

        # Create donation
        donation = Donation.objects.create(
            project=project,
            donor=request.user,
            amount=amount
        )

        serializer = DonationSerializer(donation)
        response_data['donation'] = serializer.data
        response_data['message'] = 'Donation successful!'

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Handle project ratings"""
        project = self.get_object()
        rating_value = request.data.get('rating')

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

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar projects based on category and tags"""
        project = self.get_object()

        # Get projects in same category with similar tags
        similar_projects = Project.objects.filter(
            category=project.category,
            is_active=True
        ).exclude(id=project.id).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating'),
            donations_count=Count('donations')
        )

        # If we have tags, prioritize projects with similar tags
        if project.tags.exists():
            project_tags = project.tags.values_list('id', flat=True)
            similar_projects = similar_projects.filter(
                tags__in=project_tags
            ).distinct()

        # Limit to 6 similar projects
        similar_projects = similar_projects[:6]

        serializer = ProjectListSerializer(similar_projects, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def get_recommendations(self, request):
        """Get personalized recommendations for project detail page"""
        try:
            # Use existing recommendation logic
            recommended_projects = request.get_recommendations(limit=8)

            serializer = PersonalizedRecommendationSerializer(
                recommended_projects,
                many=True,
                context={'request': request}
            )

            return Response({
                'recommendations': serializer.data,
                'count': len(recommended_projects)
            })

        except Exception as e:
            # Fallback to popular projects
            popular_projects = Project.objects.filter(is_active=True).annotate(
                total_donations=Sum('donations__amount'),
                average_rating=Avg('ratings__rating'),
                donations_count=Count('donations')
            ).order_by('-donations_count')[:8]

            serializer = ProjectListSerializer(popular_projects, many=True, context={'request': request})

            return Response({
                'recommendations': serializer.data,
                'count': len(popular_projects)
            })

    @action(detail=False, methods=['get'])
    def personalized_dashboard(self, request):
        """Create personalized user dashboard with smart recommendations"""
        activity = request.session.get('user_activity', {})
        viewed_projects = activity.get('viewed_projects', [])
        category_interests = activity.get('category_interests', {})
        search_queries = activity.get('search_queries', [])

        # Get personalized recommendations using middleware
        recommendations = request.get_recommendations(limit=8)

        # Get trending projects in user's interest categories
        if category_interests:
            trending = Project.objects.filter(
                category__slug__in=category_interests.keys(),
                is_active=True
            ).annotate(
                recent_donations=Count('donations', filter=Q(
                    donations__donation_date__gte=timezone.now() - timedelta(days=7)
                ))
            ).order_by('-recent_donations')[:5]
        else:
            trending = Project.objects.filter(is_active=True).annotate(
                recent_donations=Count('donations', filter=Q(
                    donations__donation_date__gte=timezone.now() - timedelta(days=7)
                ))
            ).order_by('-recent_donations')[:5]

        # Get similar projects to viewed ones
        if viewed_projects:
            similar_projects = Project.objects.filter(
                category__in=Project.objects.filter(id__in=viewed_projects).values_list('category', flat=True),
                is_active=True
            ).exclude(id__in=viewed_projects).annotate(
                total_donations=Sum('donations__amount'),
                average_rating=Avg('ratings__rating')
            )[:5]
        else:
            similar_projects = []

        # Calculate user engagement score
        engagement_score = min(100, len(viewed_projects) * 10 + sum(category_interests.values()) * 5)

        # Get user's donation history for insights
        user_donation_stats = {}
        if request.user.is_authenticated:
            user_donations = request.user.donations.aggregate(
                total_donated=Sum('amount'),
                donation_count=Count('id'),
                avg_donation=Avg('amount')
            )
            user_donation_stats = {
                'total_donated': float(user_donations['total_donated'] or 0),
                'donation_count': user_donations['donation_count'] or 0,
                'avg_donation': float(user_donations['avg_donation'] or 0),
            }

        return Response({
            'personalized_recommendations': PersonalizedRecommendationSerializer(recommendations, many=True,
                                                                                 context={'request': request}).data,
            'trending_in_interests': PersonalizedRecommendationSerializer(trending, many=True,
                                                                          context={'request': request}).data,
            'similar_to_viewed': PersonalizedRecommendationSerializer(similar_projects, many=True,
                                                                      context={'request': request}).data,
            'user_insights': {
                'viewed_projects_count': len(viewed_projects),
                'top_categories': sorted(category_interests.items(), key=lambda x: x[1], reverse=True)[:3],
                'engagement_score': engagement_score,
                'search_history': search_queries[-5:],
                'donation_stats': user_donation_stats
            },
            'activity_summary': {
                'session_projects_viewed': len(viewed_projects),
                'categories_explored': len(category_interests),
                'searches_performed': len(search_queries),
                'recommendation_basis': 'collaborative' if viewed_projects else 'popular'
            }
        })

    @action(detail=False, methods=['get'])
    def analytics_dashboard(self, request):
        """Platform analytics for insights and engagement metrics"""
        # User engagement metrics
        total_sessions = request.session.get('session_count', 0) + 1
        request.session['session_count'] = total_sessions
        request.session.modified = True

        # Platform-wide metrics
        total_projects = Project.objects.filter(is_active=True).count()

        # Calculate funding stats
        funded_projects_count = 0
        total_funding_ratio = 0

        if total_projects > 0:
            active_projects = Project.objects.filter(is_active=True)

            for project in active_projects:
                project_donations = project.donations.aggregate(total=Sum('amount'))['total'] or 0

                if project.total_target > 0:
                    funding_ratio = project_donations / project.total_target
                    total_funding_ratio += funding_ratio

                    if funding_ratio >= 1:
                        funded_projects_count += 1

            avg_funding_percentage = (total_funding_ratio / total_projects) if total_projects > 0 else 0
        else:
            avg_funding_percentage = 0

        # Recent activity metrics
        recent_donations = Donation.objects.filter(
            donation_date__gte=timezone.now() - timedelta(days=7)
        ).count()

        recent_projects = Project.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7),
            is_active=True
        ).count()

        metrics = {
            'user_engagement': {
                'active_sessions': total_sessions,
                'page_views_per_session': len(request.session.get('user_activity', {}).get('viewed_projects', [])),
                'categories_explored': len(request.session.get('user_activity', {}).get('category_interests', {})),
                'engagement_level': 'high' if total_sessions > 5 else 'medium' if total_sessions > 2 else 'new'
            },
            'campaign_performance': {
                'total_campaigns': total_projects,
                'funded_campaigns': funded_projects_count,
                'success_rate': f"{(funded_projects_count / total_projects * 100):.1f}%" if total_projects > 0 else "0%",
                'avg_funding_percentage': f"{(avg_funding_percentage * 100):.1f}%" if avg_funding_percentage else "0%",
            },
            'platform_activity': {
                'recent_donations_7days': recent_donations,
                'new_projects_7days': recent_projects,
                'total_active_projects': total_projects,
                'platform_health': 'excellent' if recent_donations > 10 else 'good' if recent_donations > 5 else 'growing'
            }
        }

        return Response(metrics)

    @action(detail=False, methods=['get'])
    def debug_activity(self, request):
        """Debug endpoint to check session activity"""
        activity = request.session.get('user_activity', {})

        return Response({
            'session_key': request.session.session_key,
            'session_data': dict(request.session),
            'user_activity': activity,
            'session_modified': request.session.modified,
            'debug_info': {
                'viewed_projects_count': len(activity.get('viewed_projects', [])),
                'search_queries_count': len(activity.get('search_queries', [])),
                'category_interests_count': len(activity.get('category_interests', {})),
                'last_activity': activity.get('last_activity', 'Never')
            }
        })

    @action(detail=False, methods=['get'])
    def homepage_data(self, request):
        """Get homepage data"""
        top_rated = Project.objects.filter(
            is_active=True
        ).annotate(
            average_rating=Avg('ratings__rating'),
            total_donations=Sum('donations__amount')
        ).filter(average_rating__isnull=False).order_by('-average_rating')[:5]

        latest = Project.objects.filter(
            is_active=True
        ).annotate(
            total_donations=Sum('donations__amount'),
            average_rating=Avg('ratings__rating')
        ).order_by('-created_at')[:5]

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
