from django import forms
from .models import Comment, CommentReport

class CommentForm(forms.ModelForm):
    """Form for adding or replying to a comment"""
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'rows': 3,
                'placeholder': 'Write your comment...',
                'class': 'form-control'
            })
        }  # *** FIXED: Added missing closing brace ***

class CommentReportForm(forms.ModelForm):
    """Form for reporting a comment"""
    class Meta:
        model = CommentReport
        fields = ['reason']
        widgets = {
            'reason': forms.Textarea(attrs={
                'rows': 3,
                'placeholder': 'Why are you reporting this comment?',
                'class': 'form-control'
            })
        }  # *** FIXED: Added missing closing brace ***
