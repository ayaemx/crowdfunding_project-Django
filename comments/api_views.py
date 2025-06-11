# comments/api_views.py - COMPLETE FIXED VERSION
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from projects.models import Project
from .models import Comment, CommentReport, HiddenComment
from .serializers import CommentSerializer, CommentCreateSerializer, CommentReportSerializer


class ProjectCommentsAPI(generics.ListCreateAPIView):
    """List and create comments for a project (including replies)"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user = self.request.user

        # Get ALL comments for this project (both parent and replies)
        queryset = Comment.objects.filter(
            project_id=project_id
        ).select_related('user', 'parent').order_by('created_at')

        # If user is authenticated, exclude hidden comments
        if user.is_authenticated:
            hidden_comment_ids = HiddenComment.objects.filter(
                user=user
            ).values_list('comment_id', flat=True)
            queryset = queryset.exclude(id__in=hidden_comment_ids)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        """Set user and project when creating comment"""
        project = get_object_or_404(Project, id=self.kwargs['project_id'])
        serializer.save(user=self.request.user, project=project)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def report_comment_api(request, comment_id):
    """Report a comment via API"""
    try:
        comment = get_object_or_404(Comment, id=comment_id)

        # Check if already reported
        if CommentReport.objects.filter(user=request.user, comment=comment).exists():
            return Response({
                'error': 'You have already reported this comment'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = CommentReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, comment=comment)

            # Hide comment for reporting user
            HiddenComment.objects.get_or_create(user=request.user, comment=comment)

            return Response({
                'message': 'Comment reported and hidden successfully'
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'error': f'Failed to report comment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
