import json
import logging
from django.utils.deprecation import MiddlewareMixin
from django.db.models import Count, Avg
from django.utils import timezone
from projects.models import Project

logger = logging.getLogger(__name__)


class UserActivityMiddleware(MiddlewareMixin):
    """Enhanced user activity tracking with forced session persistence"""

    def process_request(self, request):
        # FIXED: Add debug logging
        print(f"🔍 MIDDLEWARE DEBUG: Processing request to {request.path}")
        print(f"🔍 Session key: {request.session.session_key}")
        print(f"🔍 User: {request.user}")

        # Skip tracking for admin, static files
        skip_paths = ['/admin/', '/static/', '/media/', '/favicon.ico']
        if any(request.path.startswith(path) for path in skip_paths):
            return None

        # CRITICAL: Force session creation and persistence
        if not request.session.session_key:
            request.session.create()
            print(f"🔧 Created new session: {request.session.session_key}")

        # CRITICAL: Always ensure session is saved
        request.session.modified = True

        # Initialize user activity session with ALL required fields
        if 'user_activity' not in request.session:
            request.session['user_activity'] = {
                'viewed_projects': [],
                'viewed_categories': [],
                'category_interests': {},
                'search_queries': [],
                'last_activity': timezone.now().isoformat(),
            }
            print(f"🔧 Initialized activity tracking for session: {request.session.session_key}")
            logger.info(f"Initialized activity tracking for session")

        # Update last activity
        request.session['user_activity']['last_activity'] = timezone.now().isoformat()

        # CRITICAL: Force save session changes
        request.session.save()

        # ENHANCED: Track category parameter in URL
        if (request.path.startswith('/api/projects/') and
                request.method == 'GET'):
            category_param = request.GET.get('category')
            if category_param:
                self._track_category_interest(request, category_param)
                print(f"🔧 Tracked category from URL: {category_param}")

        # Track search queries with category detection
        if request.path.startswith('/api/projects/') and 'search' in request.GET:
            search_query = request.GET.get('search', '').strip()
            if search_query:
                self._track_search_query(request, search_query)
                print(f"🔧 Tracked search query: {search_query}")
                # ENHANCED: Detect category from search
                self._detect_category_from_search(request, search_query)

        return None

    def process_response(self, request, response):
        """Enhanced tracking for project views and category browsing"""
        try:
            # Track project detail views
            if (request.path.startswith('/api/projects/') and
                    request.method == 'GET' and
                    response.status_code == 200):
                # Extract project ID from URL
                path_parts = request.path.strip('/').split('/')
                if len(path_parts) >= 3 and path_parts[2].isdigit():
                    project_id = int(path_parts[2])
                    self._track_project_view(request, project_id)
                    print(f"🔧 Tracked project view: {project_id}")
        except Exception as e:
            logger.error(f"Error in activity tracking: {e}")

        return response

    def _track_project_view(self, request, project_id):
        """Track when a user views a project and its category"""
        try:
            activity = request.session.get('user_activity', {})
            viewed_projects = activity.get('viewed_projects', [])

            # Add project to viewed list
            if project_id not in viewed_projects:
                viewed_projects.append(project_id)
                if len(viewed_projects) > 20:
                    viewed_projects = viewed_projects[-20:]

                activity['viewed_projects'] = viewed_projects
                request.session['user_activity'] = activity

                # CRITICAL: Force save session
                request.session.modified = True
                request.session.save()

                print(f"🔧 SAVED project view: {project_id}, total views: {len(viewed_projects)}")
                logger.info(f"Tracked project view: {project_id}")

            # ENHANCED: Track the project's category
            try:
                project = Project.objects.select_related('category').get(id=project_id)
                if project.category:
                    self._track_category_interest(request, project.category.slug)
                    print(f"🔧 Tracked category from project: {project.category.slug}")
            except Project.DoesNotExist:
                pass

        except Exception as e:
            logger.error(f"Error tracking project view: {e}")

    def _track_category_interest(self, request, category_slug):
        """Track user interest in a category"""
        try:
            activity = request.session.get('user_activity', {})
            category_interests = activity.get('category_interests', {})
            viewed_categories = activity.get('viewed_categories', [])

            # Increment interest count for this category
            category_interests[category_slug] = category_interests.get(category_slug, 0) + 1

            # Add to viewed categories list
            if category_slug not in viewed_categories:
                viewed_categories.append(category_slug)
                if len(viewed_categories) > 10:
                    viewed_categories = viewed_categories[-10:]

            activity['category_interests'] = category_interests
            activity['viewed_categories'] = viewed_categories
            request.session['user_activity'] = activity

            # CRITICAL: Force save session
            request.session.modified = True
            request.session.save()

            print(f"🔧 SAVED category interest: {category_slug} (count: {category_interests[category_slug]})")
            logger.info(f"Tracked category interest: {category_slug} (count: {category_interests[category_slug]})")

        except Exception as e:
            logger.error(f"Error tracking category interest: {e}")

    def _track_search_query(self, request, query):
        """Track user search queries"""
        try:
            activity = request.session.get('user_activity', {})
            search_queries = activity.get('search_queries', [])

            # Add search query (keep last 10)
            if query not in search_queries:
                search_queries.append(query)
                if len(search_queries) > 10:
                    search_queries = search_queries[-10:]

                activity['search_queries'] = search_queries
                request.session['user_activity'] = activity

                # CRITICAL: Force save session
                request.session.modified = True
                request.session.save()

                print(f"🔧 SAVED search query: {query}, total searches: {len(search_queries)}")
                logger.info(f"Tracked search query: {query}")

        except Exception as e:
            logger.error(f"Error tracking search query: {e}")

    def _detect_category_from_search(self, request, search_query):
        """Detect if search query relates to specific categories"""
        try:
            from categories.models import Category

            # Check if search query matches any category names
            categories = Category.objects.all()
            query_lower = search_query.lower()

            for category in categories:
                if (category.name.lower() in query_lower or
                        query_lower in category.name.lower()):
                    self._track_category_interest(request, category.slug)
                    logger.info(f"Detected category interest from search: {category.slug}")

        except Exception as e:
            logger.error(f"Error detecting category from search: {e}")


class RecommendationMiddleware(MiddlewareMixin):
    """Enhanced recommendation system"""

    def process_request(self, request):
        request.get_recommendations = lambda limit=5: self.get_user_recommendations(request, limit)
        return None

    def get_user_recommendations(self, request, limit=5):
        """Generate recommendations based on user activity"""
        try:
            activity = request.session.get('user_activity', {})
            viewed_projects = activity.get('viewed_projects', [])
            category_interests = activity.get('category_interests', {})

            print(
                f"🔧 RECOMMENDATIONS DEBUG: viewed_projects={viewed_projects}, category_interests={category_interests}")

            # Base queryset
            base_queryset = Project.objects.filter(is_active=True)

            # Exclude viewed projects
            if viewed_projects:
                base_queryset = base_queryset.exclude(id__in=viewed_projects)

            # ENHANCED: Prioritize categories with high interest
            if category_interests:
                # Sort categories by interest level
                sorted_categories = sorted(category_interests.items(), key=lambda x: x[1], reverse=True)
                top_category_slugs = [cat[0] for cat in sorted_categories[:3]]

                recommendations = base_queryset.filter(
                    category__slug__in=top_category_slugs
                ).annotate(
                    donations_count=Count('donations')
                ).order_by('-donations_count')[:limit]

                if recommendations.count() >= limit:
                    logger.info(f"Generated {len(recommendations)} category-based recommendations")
                    return recommendations

            # Fallback to popular projects
            recommendations = base_queryset.annotate(
                donations_count=Count('donations')
            ).order_by('-donations_count')[:limit]

            logger.info(f"Generated {len(recommendations)} popular recommendations")
            return recommendations

        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return Project.objects.filter(is_active=True)[:limit]
