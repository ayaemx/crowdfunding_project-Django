# comments/forms.py
from django import forms
from .models import Comment, CommentReport

# Form for adding or replying to a comment
class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Write your comment...'})
        }

# Form for reporting a comment
class CommentReportForm(forms.ModelForm):
    class Meta:
        model = CommentReport
        fields = ['reason']
        widgets = {
            'reason': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Why are you reporting this?'}),
        }