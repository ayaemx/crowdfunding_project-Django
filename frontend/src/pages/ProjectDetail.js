import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Rating,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Person,
  Star,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  MoreVert,
  Edit,
  Report,
  Cancel
} from '@mui/icons-material';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from '../components/ProjectCard';
import CommentSection from '../components/CommentSection';
import ReportModal from '../components/ReportModal';

// Helper function to handle Django media URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-project.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://127.0.0.1:8000${imagePath}`;
};

// Image Slider Component
const ImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ height: 400, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
        <Typography>No images available</Typography>
      </Box>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Box sx={{ position: 'relative', height: 400, borderRadius: 2, overflow: 'hidden' }}>
      <img
        src={getImageUrl(images[currentIndex]?.image)}
        alt={`Project image ${currentIndex + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {images.length > 1 && (
        <>
          <IconButton
            onClick={prevImage}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <ArrowBackIos />
          </IconButton>

          <IconButton
            onClick={nextImage}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </>
      )}

      {images.length > 1 && (
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1
        }}>
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();

  const [project, setProject] = useState(null);
  const [similarProjects, setSimilarProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [errors, setErrors] = useState({});

  // Project Management States
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadProjectData = useCallback(async () => {
    if (!id) {
      console.error('No project ID provided');
      navigate('/projects');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading project with ID:', id);

      const projectResponse = await projectsAPI.getDetail(id);
      setProject(projectResponse.data);

      // Try to load similar projects
      try {
        const similarResponse = await projectsAPI.getSimilar(id);
        setSimilarProjects(similarResponse.data);
      } catch (similarError) {
        console.log('Similar projects not available:', similarError);
        setSimilarProjects([]);
      }

    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleDonate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setDonationLoading(true);
    try {
      await projectsAPI.donate(id, parseFloat(donationAmount));
      setDonationSuccess(true);
      setDonationOpen(false);

      // Update project data
      setProject(prev => ({
        ...prev,
        total_donations: prev.total_donations + parseFloat(donationAmount),
        donations_count: (prev.donations_count || 0) + 1
      }));

      setDonationAmount('');

    } catch (error) {
      console.error('Donation failed:', error);
      setErrors({ donation: 'Donation failed. Please try again.' });
    } finally {
      setDonationLoading(false);
    }
  };

  const handleRate = async (newRating) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await projectsAPI.rate(id, newRating);
      setUserRating(newRating);
      loadProjectData();
    } catch (error) {
      console.error('Rating failed:', error);
    }
  };

  // Project Management Functions
  const handleCancelProject = async () => {
    if (!cancelReason.trim()) return;

    try {
      await projectsAPI.cancelProject(id, cancelReason);
      setCancelOpen(false);
      setCancelReason('');
      loadProjectData();
    } catch (error) {
      console.error('Failed to cancel project:', error);
    }
  };

  const canCancelProject = () => {
    if (!project || !user) return false;
    if (project.user?.id !== user.id) return false;

    const progressPercentage = (project.total_donations / project.total_target) * 100;
    return progressPercentage < 25;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount).replace('EGP', 'EGP');
  };

  const getDaysRemaining = () => {
    if (!project?.end_time) return null;
    const endDate = new Date(project.end_time);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading project...</Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Project not found</Typography>
        <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Browse Projects
        </Button>
      </Container>
    );
  }

  const progressPercentage = project ?
    Math.min((project.total_donations / project.total_target) * 100, 100) : 0;

  const daysRemaining = getDaysRemaining();
  const shareUrl = `${window.location.origin}/projects/${id}`;
  const shareTitle = project.title || 'Check out this amazing project!';
  const isOwner = user && project.user?.id === user.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid xs={12} md={8}>
          {/* Project Images Slider */}
          <Box sx={{ mb: 3 }}>
            <ImageSlider images={project.pictures || []} />
          </Box>

          {/* Project Info */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {project.category && (
                <Chip
                  label={project.category.name}
                  color="primary"
                  variant="outlined"
                />
              )}

              {/* Project Management Menu */}
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Share Buttons */}
                <FacebookShareButton url={shareUrl} quote={shareTitle}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>

                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>

                <WhatsappShareButton url={shareUrl} title={shareTitle}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>

                <IconButton
                  onClick={() => setIsFavorited(!isFavorited)}
                  sx={{ color: isFavorited ? '#FF6B35' : '#6B7280' }}
                >
                  {isFavorited ? <Favorite /> : <FavoriteBorder />}
                </IconButton>

                {/* Project Management Menu */}
                {isAuthenticated && (
                  <>
                    <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor)}
                      onClose={() => setMenuAnchor(null)}
                    >
                      {isOwner && (
                        <MenuItem onClick={() => navigate(`/projects/${id}/edit`)}>
                          <Edit sx={{ mr: 1 }} />
                          Edit Project
                        </MenuItem>
                      )}
                      {isOwner && canCancelProject() && (
                        <MenuItem onClick={() => setCancelOpen(true)}>
                          <Cancel sx={{ mr: 1 }} />
                          Cancel Project
                        </MenuItem>
                      )}
                      {!isOwner && (
                        <MenuItem onClick={() => setReportOpen(true)}>
                          <Report sx={{ mr: 1 }} />
                          Report Project
                        </MenuItem>
                      )}
                    </Menu>
                  </>
                )}
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
              {project.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              {project.details}
            </Typography>

            {/* Creator Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={project.user?.profile_picture}
                sx={{ width: 48, height: 48, mr: 2 }}
              >
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="500">
                  {project.user?.first_name} {project.user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Project Creator
                </Typography>
              </Box>
            </Box>

            {/* Rating Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rate this project
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={userRating || rating}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                    handleRate(newValue);
                  }}
                  disabled={!isAuthenticated}
                />
                {project.average_rating > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Average: {project.average_rating.toFixed(1)} ({project.ratings_count} ratings)
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Comments Section */}
          <CommentSection projectId={id} />
        </Grid>

        {/* Sidebar */}
        <Grid xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Progress */}
              <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                {formatCurrency(project.total_donations)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                raised of {formatCurrency(project.total_target)} goal
              </Typography>

              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  mb: 2,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#F3F4F6',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#00B964',
                    borderRadius: 4
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {progressPercentage.toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    funded
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {project.donations_count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    donors
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {daysRemaining || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    days left
                  </Typography>
                </Box>
              </Box>

              {/* Donate Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setDonationOpen(true)}
                disabled={daysRemaining === 0}
                sx={{
                  bgcolor: '#00B964',
                  '&:hover': { bgcolor: '#00A855' },
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {daysRemaining === 0 ? 'Campaign Ended' : 'Donate Now'}
              </Button>

              {!isAuthenticated && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                  <Button variant="text" onClick={() => navigate('/login')}>
                    Sign in
                  </Button> to donate to this campaign
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Similar Projects */}
      {similarProjects.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Similar campaigns
          </Typography>
          <Grid container spacing={3}>
            {similarProjects.slice(0, 4).map(similarProject => (
              <Grid xs={12} sm={6} md={3} key={similarProject.id}>
                <ProjectCard project={similarProject} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Donation Modal */}
      <Dialog
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Support this campaign
          <IconButton onClick={() => setDonationOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your donation will help {project.user?.first_name} reach their goal of {formatCurrency(project.total_target)}.
          </Typography>

          <TextField
            fullWidth
            label="Donation Amount (EGP)"
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Enter amount"
            InputProps={{
              inputProps: { min: 1 }
            }}
          />

          {/* Quick amounts */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[25, 50, 100, 250, 500].map(amount => (
              <Chip
                key={amount}
                label={`${amount} EGP`}
                onClick={() => setDonationAmount(amount.toString())}
                variant={donationAmount === amount.toString() ? 'filled' : 'outlined'}
                color="primary"
                clickable
              />
            ))}
          </Box>

          {errors.donation && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.donation}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDonationOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDonate}
            disabled={!donationAmount || donationLoading}
            sx={{ bgcolor: '#00B964', '&:hover': { bgcolor: '#00A855' } }}
          >
            {donationLoading ? 'Processing...' : `Donate ${donationAmount ? formatCurrency(donationAmount) : ''}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Cancellation Modal */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Project</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. Your project will be permanently cancelled.
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Current funding: {progressPercentage.toFixed(1)}% (Less than 25% threshold allows cancellation)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please explain why you're cancelling this project..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Cancel</Button>
          <Button onClick={handleCancelProject} color="error" disabled={!cancelReason.trim()}>
            Cancel Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        projectId={id}
        type="project"
      />

      {/* Success Alert */}
      {donationSuccess && (
        <Alert
          severity="success"
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
          onClose={() => setDonationSuccess(false)}
        >
          Thank you for your donation! 🎉
        </Alert>
      )}
    </Container>
  );
};

export default ProjectDetail;
