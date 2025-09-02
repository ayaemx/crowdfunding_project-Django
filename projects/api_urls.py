from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ProjectViewSet

# Create router and register viewset
router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    # Include router URLs (this gives us all the standard endpoints)
    path('', include(router.urls)),

    # FIXED: Add custom endpoints that aren't in the router
    path('my_projects/', ProjectViewSet.as_view({'get': 'my_projects'}), name='my-projects'),
    path('my_donations/', ProjectViewSet.as_view({'get': 'my_donations'}), name='my-donations'),
    path('homepage_data/', ProjectViewSet.as_view({'get': 'homepage_data'}), name='homepage-data'),
    path('personalized_dashboard/', ProjectViewSet.as_view({'get': 'personalized_dashboard'}),
         name='personalized-dashboard'),
    path('analytics_dashboard/', ProjectViewSet.as_view({'get': 'analytics_dashboard'}), name='analytics-dashboard'),
    path('get_recommendations/', ProjectViewSet.as_view({'get': 'get_recommendations'}), name='get-recommendations'),

    # DEBUG: Add debug endpoint
    path('debug_activity/', ProjectViewSet.as_view({'get': 'debug_activity'}), name='debug-activity'),
]
