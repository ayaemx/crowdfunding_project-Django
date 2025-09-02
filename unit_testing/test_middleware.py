# unit_testing/test_middleware.py - FINAL FIXED VERSION
import os
import sys
import django
from django.test import TestCase, RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware
from django.contrib.auth import get_user_model
from django.http import HttpResponse

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crowdfunding_projectt.settings')
django.setup()

from crowdfunding_projectt.middleware import UserActivityMiddleware, RecommendationMiddleware
from projects.models import Project
from categories.models import Category

User = get_user_model()


class MiddlewareTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        # FIXED: Use email as primary field, phone_number instead of phone
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='01234567890'  # FIXED: Use phone_number
        )
        self.category = Category.objects.create(name='Technology')
        self.project = Project.objects.create(
            title='Test Project',
            details='Test details',
            total_target=10000,
            start_time='2024-01-01',
            end_time='2024-12-31',
            owner=self.user,
            category=self.category,
            is_active=True
        )

    def add_session_to_request(self, request):
        """Helper to add session to request"""
        middleware = SessionMiddleware(lambda req: None)
        middleware.process_request(request)
        request.session.save()

    def test_user_activity_middleware_initialization(self):
        """Test that middleware initializes user activity session"""
        request = self.factory.get('/api/projects/')
        self.add_session_to_request(request)

        middleware = UserActivityMiddleware(lambda req: None)
        middleware.process_request(request)

        self.assertIn('user_activity', request.session)
        self.assertIn('viewed_projects', request.session['user_activity'])
        print("✅ Middleware initialization test passed")

    def test_project_view_tracking(self):
        """Test that project views are tracked"""
        request = self.factory.get(f'/api/projects/{self.project.id}/')
        self.add_session_to_request(request)

        response = HttpResponse()
        response.status_code = 200

        middleware = UserActivityMiddleware(lambda req: response)
        middleware.process_request(request)
        middleware.process_response(request, response)

        activity = request.session.get('user_activity', {})
        self.assertIn(self.project.id, activity.get('viewed_projects', []))
        print("✅ Project view tracking test passed")

    def test_recommendations_generation(self):
        """Test that recommendations are generated"""
        request = self.factory.get('/api/projects/recommendations/')
        self.add_session_to_request(request)

        middleware = RecommendationMiddleware(lambda req: None)
        middleware.process_request(request)

        recommendations = request.get_recommendations(limit=3)
        self.assertIsNotNone(recommendations)
        self.assertLessEqual(len(recommendations), 3)
        print("✅ Recommendations generation test passed")
