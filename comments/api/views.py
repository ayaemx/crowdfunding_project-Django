from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from projects.models import Project
from ..models import Comment, HiddenComment
from .serializers import CommentSerializer, CommentReportSerializer, HiddenCommentSerializer
from rest_framework.permissions import IsAuthenticated
# POST /api/comments/project/<id>/add/
class AddCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        project = get_object_or_404(Project, id=pk)
        data = request.data.copy()
        data['project'] = project.id
        data['user'] = request.user.id  # Now this will always have a valid user
        serializer = CommentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReplyCommentView(APIView):
    permission_classes = [IsAuthenticated]

class ReportCommentView(APIView):
    permission_classes = [IsAuthenticated]