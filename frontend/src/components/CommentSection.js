import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Person,
  Reply,
  Send,
  MoreVert,
  Report
} from '@mui/icons-material';
import { commentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReportModal from './ReportModal';

const CommentSection = ({ projectId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');

  // Report functionality states
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  const loadComments = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      console.log('Loading comments for project:', projectId);
      const response = await commentsAPI.getProjectComments(projectId);

      let commentsData = [];
      if (response.data) {
        if (response.data.results) {
          commentsData = response.data.results;
        } else if (Array.isArray(response.data)) {
          commentsData = response.data;
        } else {
          commentsData = [response.data];
        }
      }

      console.log('Comments loaded:', commentsData.length);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
      setError('Failed to load comments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment || newComment.trim().length === 0) {
      setError('Please enter a comment.');
      return;
    }

    if (newComment.trim().length < 3) {
      setError('Comment must be at least 3 characters long.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const commentData = {
        content: newComment.trim(),
        parent: replyTo
      };

      console.log('Submitting comment:', commentData);
      await commentsAPI.addComment(projectId, commentData);
      setNewComment('');
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Report comment functionality
  const handleReportComment = (comment) => {
    setSelectedComment(comment);
    setReportOpen(true);
    setMenuAnchor(null);
  };

  // Handle successful report submission with delayed refresh
  const handleReportSuccess = () => {
  console.log('Report submitted successfully, updating UI...');
  setReportOpen(false);
  setSelectedComment(null);

  // IMMEDIATE: Remove the reported comment from local state
  if (selectedComment) {
    setComments(prevComments =>
      prevComments.filter(comment => comment.id !== selectedComment.id)
    );
  }
  // Also refresh from server to ensure consistency
  setTimeout(() => {
    loadComments();
  }, 500);
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
        border: comment.is_under_review ? '1px solid #FFA726' : '1px solid #E8F5E8',
        borderRadius: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,168,107,0.1)'
        }
      }}
    >
      {/* ADDED: Moderation indicator */}
      {comment.is_under_review && (
        <Box sx={{
          bgcolor: '#FFF3E0',
          border: '1px solid #FFB74D',
          borderRadius: 1,
          p: 1,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="caption" color="#F57C00" fontWeight="bold">
            ⚠️ This comment is under review ({comment.report_count} reports)
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          src={comment.user?.profile_picture}
          sx={{
            width: { xs: 32, md: 40 },
            height: { xs: 32, md: 40 },
            opacity: comment.is_under_review ? 0.7 : 1
          }}
        >
          <Person />
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ opacity: comment.is_under_review ? 0.7 : 1 }}
            >
              {comment.user?.first_name} {comment.user?.last_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.created_at)}
              </Typography>
              {/* Report menu for comments */}
              {isAuthenticated && comment.user?.id !== user?.id && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget);
                    setSelectedComment(comment);
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              opacity: comment.is_under_review ? 0.7 : 1,
              fontStyle: comment.is_under_review ? 'italic' : 'normal'
            }}
          >
            {comment.content}
          </Typography>

          {!isReply && isAuthenticated && (
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
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </Box>
      )}
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Comments ({comments.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            border: '1px solid #E8F5E8',
            borderRadius: 3
          }}
        >
          {replyTo && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#F3F4F6', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Replying to comment...
                <Button size="small" onClick={() => setReplyTo(null)} sx={{ ml: 1 }}>
                  Cancel
                </Button>
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmitComment}>
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 2 : 3}
              placeholder={replyTo ? "Write a reply..." : "Share your thoughts about this campaign..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
              variant="outlined"
              helperText={`${newComment.length}/1000 characters`}
              inputProps={{ maxLength: 1000 }}
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={submitting ? <CircularProgress size={16} /> : <Send />}
              disabled={submitting || !newComment.trim() || newComment.trim().length < 3}
              sx={{
                bgcolor: '#00A86B',
                '&:hover': { bgcolor: '#00695C' }
              }}
            >
              {submitting ? 'Posting...' : (replyTo ? 'Post Reply' : 'Post Comment')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            textAlign: 'center',
            border: '1px solid #E8F5E8',
            borderRadius: 3
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Please sign in to leave a comment
          </Typography>
        </Paper>
      )}

      {/* Comments List */}
      <Box>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading comments...</Typography>
          </Box>
        ) : comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              border: '1px solid #E8F5E8',
              borderRadius: 3
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to share your thoughts!
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Comment Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleReportComment(selectedComment)}>
          <Report sx={{ mr: 1, color: '#EF5350' }} />
          Report Comment
        </MenuItem>
      </Menu>

      {/* Report Modal for Comments */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        commentId={selectedComment?.id}
        type="comment"
        onSuccess={handleReportSuccess}
      />
    </Box>
  );
};

export default CommentSection;
