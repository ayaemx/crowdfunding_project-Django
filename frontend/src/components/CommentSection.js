import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Person, MoreVert, Reply, Send } from '@mui/icons-material';
import { commentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CommentSection = ({ projectId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const loadComments = useCallback(async () => {
    try {
      const response = await commentsAPI.getProjectComments(projectId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }, [projectId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await commentsAPI.addComment(projectId, {
        content: newComment,
        parent: replyTo
      });
      setNewComment('');
      setReplyTo(null);
      loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment, isReply = false) => (
    <Paper 
      key={comment.id} 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: 2, 
        ml: isReply ? { xs: 2, md: 4 } : 0,
        bgcolor: isReply ? '#F9FAFB' : 'white',
        border: '1px solid #E5E7EB',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar 
          src={comment.user?.profile_picture}
          sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}
        >
          <Person />
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {comment.user?.first_name} {comment.user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(comment.created_at)}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
            {comment.content}
          </Typography>
          
          {!isReply && (
            <Button
              size="small"
              startIcon={<Reply />}
              onClick={() => setReplyTo(comment.id)}
              sx={{ color: '#6B7280' }}
            >
              Reply
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Render replies */}
      {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Comments ({comments.length})
      </Typography>
      
      {/* Add Comment Form */}
      {isAuthenticated ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 4,
            border: '1px solid #E5E7EB',
            borderRadius: 2
          }}
        >
          {replyTo && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#F3F4F6', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Replying to comment...
                <Button size="small" onClick={() => setReplyTo(null)} sx={{ ml: 1 }}>
                  Cancel
                </Button>
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar 
              src={user?.profile_picture}
              sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}
            >
              <Person />
            </Avatar>
            
            <Box component="form" onSubmit={handleSubmitComment} sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                placeholder={replyTo ? "Write a reply..." : "Share your thoughts about this campaign..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<Send />}
                disabled={loading || !newComment.trim()}
                sx={{ 
                  bgcolor: '#00B964', 
                  '&:hover': { bgcolor: '#00A855' }
                }}
              >
                {loading ? 'Posting...' : (replyTo ? 'Post Reply' : 'Post Comment')}
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 4, 
            textAlign: 'center',
            border: '1px solid #E5E7EB',
            borderRadius: 2
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Please sign in to leave a comment
          </Typography>
        </Paper>
      )}
      
      {/* Comments List */}
      <Box>
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 4, md: 6 }, 
              textAlign: 'center',
              border: '1px solid #E5E7EB',
              borderRadius: 2
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to share your thoughts!
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CommentSection;
