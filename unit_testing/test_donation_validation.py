# unit_testing/test_donation_validation.py - FINAL WORKING VERSION
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crowdfunding_projectt.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from projects.models import Project, Donation
from categories.models import Category
from django.utils import timezone
from decimal import Decimal

User = get_user_model()


class DonationValidationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='donor@example.com',
            first_name='Donor',
            last_name='User',
            phone_number='01234567890'
        )
        self.owner = User.objects.create_user(
            email='owner@example.com',
            first_name='Owner',
            last_name='User',
            phone_number='01987654321'
        )
        self.category = Category.objects.create(name='Technology')

        # FIXED: Use timezone-aware dates
        self.project = Project.objects.create(
            title='Test Project',
            details='Test details',
            total_target=Decimal('1000.00'),  # FIXED: Use Decimal
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(days=30),
            owner=self.owner,
            category=self.category,
            is_active=True
        )

    def test_donation_within_target(self):
        """Test donation within target amount"""
        self.client.force_authenticate(user=self.user)

        response = self.client.post(f'/api/projects/{self.project.id}/donate/', {
            'amount': '500.00'  # FIXED: Use string to avoid float conversion issues
        }, format='json')

        print(f"Donation response status: {response.status_code}")
        print(f"Donation response data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data.get('warning'))
        print("✅ Donation within target test passed")

    def test_donation_exceeds_target(self):
        """Test donation that exceeds remaining target"""
        # Add existing donation using Decimal
        Donation.objects.create(
            project=self.project,
            donor=self.user,
            amount=Decimal('800.00')  # FIXED: Use Decimal
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.post(f'/api/projects/{self.project.id}/donate/', {
            'amount': '500.00'  # Only 200 remaining, so this exceeds by 300
        }, format='json')

        print(f"Excess donation response status: {response.status_code}")
        print(f"Excess donation response data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data.get('warning'))
        self.assertEqual(response.data['excess_amount'], 300.0)
        print("✅ Donation exceeds target test passed")

    def test_project_detail_validation_data(self):
        """Test that project detail provides validation data"""
        response = self.client.get(f'/api/projects/{self.project.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('remaining_amount', response.data)
        self.assertIn('is_fully_funded', response.data)
        self.assertIn('funding_percentage', response.data)
        print("✅ Project detail validation data test passed")
