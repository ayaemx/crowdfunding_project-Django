import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Share,
  Favorite,
  Report,
  AttachMoney,
  CalendarToday,
  Person,
  Comment
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, authAPI } from '../services/api';
import ImageSlider from '../components/ImageSlider';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [similarProjects, setSimilarProjects] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Donation modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  // Rating state
  const [userRating, setUserRating] = useState(0);
  const [rating, setRating] = useState(false);

  const loadProjectDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');

      // Load project details
      const projectResponse = await projectsAPI.getProject(id);
      const projectData = projectResponse.data;

      setProject(projectData);

      // Load similar projects, comments in parallel (with better error handling)
      const [similarResponse, commentsResponse] = await Promise.all([
        projectsAPI.getSimilarProjects(id).catch((err) => {
          console.log('Similar projects not available:', err);
          return { data: [] };
        }),
        projectsAPI.getProjectComments(id).catch((err) => {
          console.log('Comments not available:', err);
          return { data: [] };
        })
      ]);

      setSimilarProjects(Array.isArray(similarResponse.data) ? similarResponse.data : similarResponse.data?.results || []);
      setComments(Array.isArray(commentsResponse.data) ? commentsResponse.data : commentsResponse.data?.results || []);

    } catch (error) {
      console.error('Failed to load project:', error);
      setError('Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) return;

    setDonating(true);
    try {
      await projectsAPI.donateToProject(id, { amount: donationAmount });
      setShowDonationModal(false);
      setDonationAmount('');
      loadProjectDetails();
    } catch (error) {
      console.error('Donation failed:', error);
    } finally {
      setDonating(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      await projectsAPI.addComment(id, { content: newComment });
      setNewComment('');
      loadProjectDetails();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleRateProject = async (value) => {
    setRating(true);
    try {
      await projectsAPI.rateProject(id, { rating: value });
      setUserRating(value);
      loadProjectDetails();
    } catch (error) {
      console.error('Failed to rate project:', error);
    } finally {
      setRating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount || 0).replace('EGP', 'EGP');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to safely render category
  const renderCategory = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return 'Uncategorized';
  };

  // Helper function to safely render tags
  const renderTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return [];
    return tags.map((tag, index) => {
      const tagValue = typeof tag === 'string' ? tag : (tag.name || tag.toString());
      return (
        <Chip key={index} label={tagValue} size="small" variant="outlined" />
      );
    });
  };

  // Helper function to safely render user name
  const renderUserName = (user) => {
    if (!user) return 'Unknown User';
    if (typeof user === 'string') return user;
    if (typeof user === 'object') {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown User';
    }
    return 'Unknown User';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading project...
        </Typography>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Project not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  const progressPercentage = ((project.total_donations || 0) / (project.total_target || 1)) * 100;
  const daysRemaining = Math.ceil((new Date(project.end_time) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Project Images */}
          {project.pictures && project.pictures.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <ImageSlider images={project.pictures} />
            </Box>
          )}

          {/* Project Info */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {project.title || 'Untitled Project'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip label={renderCategory(project.category)} color="primary" />
                <Rating value={project.average_rating || 0} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({project.ratings_count || 0} ratings)
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {project.details || 'No description available.'}
              </Typography>

              {/* Tags - FIXED: Properly handle tag rendering */}
              {project.tags && project.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {renderTags(project.tags)}
                </Box>
              )}

              {/* Creator Info - FIXED: Properly handle user object */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                <Avatar>
                  {project.creator?.first_name?.[0] || <Person />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    Created by {renderUserName(project.creator)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(project.created_at)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comments ({comments.length})
              </Typography>

              {/* Add Comment */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={commenting || !newComment.trim()}
                  startIcon={<Comment />}
                >
                  {commenting ? 'Adding...' : 'Add Comment'}
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Comments List - FIXED: Properly handle comment user objects */}
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        {comment.user?.first_name?.[0] || <Person />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {renderUserName(comment.user)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.content || 'No content'}
                    />
                  </ListItem>
                ))}
              </List>

              {comments.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No comments yet. Be the first to comment!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Funding Progress */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                {formatCurrency(project.total_donations)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                raised of {formatCurrency(project.total_target)} goal
              </Typography>

              <LinearProgress
                variant="determinate"
                value={Math.min(progressPercentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 2,
                  backgroundColor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressPercentage >= 100 ? '#4CAF50' : '#2C3E2D'
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  <strong>{progressPercentage.toFixed(1)}%</strong> funded
                </Typography>
                <Typography variant="body2">
                  <strong>{project.donations_count || 0}</strong> backers
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign ended'}
                </Typography>
              </Box>

              {/* Donate Button */}
              {daysRemaining > 0 && (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setShowDonationModal(true)}
                  startIcon={<AttachMoney />}
                  sx={{
                    background: 'linear-gradient(135deg, #00B964 0%, #00A855 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #00A855 0%, #009648 100%)' },
                    mb: 2
                  }}
                >
                  Back This Project
                </Button>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: project.title,
                        url: window.location.href
                      }).catch(() => {
                        navigator.clipboard.writeText(window.location.href);
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  sx={{ flex: 1 }}
                >
                  Share
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Report />}
                  color="error"
                  sx={{ flex: 1 }}
                >
                  Report
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Rate Project */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rate This Project
              </Typography>
              <Rating
                value={userRating}
                onChange={(event, newValue) => handleRateProject(newValue)}
                disabled={rating}
                size="large"
              />
            </CardContent>
          </Card>

          {/* Similar Projects - FIXED: Properly handle similar project objects */}
          {similarProjects.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Similar Projects
                </Typography>
                {similarProjects.slice(0, 4).map((similarProject) => (
                  <Card
                    key={similarProject.id}
                    sx={{ mb: 2, cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${similarProject.id}`)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {similarProject.title || 'Untitled Project'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(similarProject.total_donations)} raised
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onClose={() => setShowDonationModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Back This Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Donation Amount (EGP)"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDonationModal(false)}>Cancel</Button>
          <Button
            onClick={handleDonate}
            variant="contained"
            disabled={donating || !donationAmount || donationAmount <= 0}
          >
            {donating ? 'Processing...' : `Donate ${formatCurrency(donationAmount)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail;
