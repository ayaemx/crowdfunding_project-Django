from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction
from django.db.models import F, Q
from .models import Comment, CommentReport
from .serializers import CommentSerializer, CommentCreateSerializer, CommentReportSerializer
from projects.models import Project
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


class ProjectCommentsListCreateAPI(generics.ListCreateAPIView):
    """List and create comments for a project"""
    serializer_class = CommentSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def get_queryset(self):
        project_id = self.kwargs['project_id']

        # FIXED: Always exclude reported comments for regular users
        base_queryset = Comment.objects.filter(
            project_id=project_id,
            parent__isnull=True
        ).select_related('user').prefetch_related(
            'replies__user'
        )

        # Hide reported comments from regular users (not staff)
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            # CRITICAL: Filter out reported comments immediately
            base_queryset = base_queryset.filter(is_reported=False)

        return base_queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def create(self, request, *args, **kwargs):
        """Create a new comment with enhanced validation"""
        project_id = self.kwargs['project_id']
        project = get_object_or_404(Project, id=project_id)

        # Debug logging
        print(f"Comment creation request data: {request.data}")
        print(f"User: {request.user}")
        print(f"Project ID: {project_id}")

        # Get parent comment if this is a reply
        parent_id = request.data.get('parent')
        parent = None
        if parent_id:
            try:
                parent = Comment.objects.get(
                    id=parent_id,
                    project=project,
                    is_reported=False  # Don't allow replies to reported comments
                )
                print(f"Reply to comment ID: {parent_id}")
            except Comment.DoesNotExist:
                return Response(
                    {'error': 'Parent comment not found or has been removed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Get and validate content
        content = request.data.get('content', '')
        if isinstance(content, str):
            content = content.strip()

        print(f"Content received: '{content}' (length: {len(content) if content else 0})")

        if not content:
            return Response(
                {'error': 'Comment content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(content) < 3:
            return Response(
                {'error': 'Comment must be at least 3 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # Create comment directly
                comment = Comment.objects.create(
                    project=project,
                    user=request.user,
                    content=content,
                    parent=parent
                )

                print(f"Comment created successfully: ID {comment.id}")

                # Return the created comment
                response_serializer = CommentSerializer(comment, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error creating comment: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': 'Failed to create comment. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CommentReportAPI(generics.CreateAPIView):
    """Report inappropriate comment - IMMEDIATE HIDING"""
    serializer_class = CommentReportSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, comment_id):
        """Handle comment reporting with immediate hiding"""
        comment = get_object_or_404(Comment, id=comment_id)

        # Debug logging
        print(f"Comment report request data: {request.data}")
        print(f"Comment ID: {comment_id}")
        print(f"Reporter: {request.user}")
        print(f"Comment current is_reported status: {comment.is_reported}")

        # Prevent self-reporting
        if comment.user == request.user:
            return Response(
                {'error': 'You cannot report your own comment'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if comment is already reported
        if comment.is_reported:
            return Response(
                {'error': 'This comment has already been reported and hidden'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate required fields
        report_type = request.data.get('report_type')
        description = request.data.get('description')

        if not report_type:
            return Response(
                {'error': 'Report type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not description or not description.strip():
            return Response(
                {'error': 'Description is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(description.strip()) < 10:
            return Response(
                {'error': 'Description must be at least 10 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already reported this comment
        existing_report = CommentReport.objects.filter(
            comment=comment,
            reporter=request.user
        ).first()

        if existing_report:
            return Response(
                {'error': 'You have already reported this comment'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # Create the report
                report = CommentReport.objects.create(
                    comment=comment,
                    reporter=request.user,
                    report_type=report_type,
                    description=description.strip()
                )

                # CRITICAL: Immediately hide the comment
                comment.is_reported = True
                comment.save(update_fields=['is_reported'])

                print(f"Comment report created successfully: ID {report.id}")
                print(f"Comment {comment.id} marked as reported: {comment.is_reported}")

                return Response({
                    'message': 'Comment reported successfully and has been hidden',
                    'report_id': report.id,
                    'comment_hidden': True
                }, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            print(f"IntegrityError creating comment report: {e}")
            return Response(
                {'error': 'You have already reported this comment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error creating comment report: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': 'Failed to submit report. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
