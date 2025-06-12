import React, { useState, useEffect } from 'react';
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
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Rating,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Share,
  Favorite,
  FavoriteBorder,
  Person,
  CalendarToday,
  LocationOn,
  Star,
  Close
} from '@mui/icons-material';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/CommentSection';
import ProjectCard from '../components/ProjectCard';

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

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // Load project details
      const projectResponse = await projectsAPI.getDetail(id);
      setProject(projectResponse.data);

      // Load similar projects
      const similarResponse = await projectsAPI.getSimilar(id);
      setSimilarProjects(similarResponse.data);

    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

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
      loadProjectData(); // Refresh project data
    } catch (error) {
      console.error('Donation failed:', error);
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
      loadProjectData(); // Refresh to get updated rating
    } catch (error) {
      console.error('Rating failed:', error);
    }
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

  const progressPercentage = project ?
    Math.min((project.total_donations / project.total_target) * 100, 100) : 0;

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

  const daysRemaining = getDaysRemaining();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Project Images */}
          <Box sx={{ mb: 3 }}>
            <img
              src={project.pictures?.[0]?.image || '/placeholder-project.jpg'}
              alt={project.title}
              style={{
                width: '100%',
                height: isMobile ? '250px' : '400px',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small">
                  <Share />
                </IconButton>
                <IconButton size="small">
                  <FavoriteBorder />
                </IconButton>
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
        <Grid item xs={12} md={4}>
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
              <Grid item xs={12} sm={6} md={3} key={similarProject.id}>
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
