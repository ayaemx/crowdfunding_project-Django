import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  CardActions,
  CardMedia,
  Divider
} from '@mui/material';
import {
  Add,
  TrendingUp,
  Favorite,
  AttachMoney,
  Cancel,
  Edit,
  Visibility,
  MoreVert,
  Campaign,
  Analytics,
  Settings,
  Search,
  Category,
  Timeline,
  Refresh,
  Delete,
  Share,
  Assessment,
  MonetizationOn,
  People,
  CalendarToday,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, projectsAPI, SessionManager } from '../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [myProjects, setMyProjects] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [userActivity, setUserActivity] = useState(null);
  const [rawActivityData, setRawActivityData] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRaised: 0,
    totalDonated: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Project Management States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuProject, setMenuProject] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading dashboard data...');

      // Enhanced session management
      await SessionManager.ensureSession();
      await new Promise(resolve => setTimeout(resolve, 800));

      // Enhanced activity data loading with retry mechanism
      let activityDebugResponse = { user_activity: {}, debug_info: {} };
      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          const response = await fetch('http://localhost:8000/api/projects/debug_activity/', {
            credentials: 'include'
          });
          if (response.ok) {
            activityDebugResponse = await response.json();
            console.log(`🔧 Activity data loaded (attempt ${attempt + 1}):`, activityDebugResponse);
            if (activityDebugResponse.user_activity &&
                Object.keys(activityDebugResponse.user_activity).length > 0) {
              break;
            }
          }
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.log('⚠️ Failed to load activity data:', error);
      }

      setRawActivityData(activityDebugResponse);

      // Load user's projects, donations, and enhanced activity
      const [projectsResponse, donationsResponse, dashboardResponse] = await Promise.all([
        authAPI.getMyProjects(),
        authAPI.getMyDonations(),
        projectsAPI.getPersonalizedDashboard().catch(() => ({ data: { user_insights: {} } }))
      ]);

      const projectsData = projectsResponse.data?.results || projectsResponse.data || [];
      const donationsData = donationsResponse.data?.results || donationsResponse.data || [];

      setMyProjects(Array.isArray(projectsData) ? projectsData : []);
      setMyDonations(Array.isArray(donationsData) ? donationsData : []);

      // Enhanced activity data combination (DON'T MODIFY THIS SECTION)
      const combinedActivity = {
        viewed_projects_count: activityDebugResponse.debug_info?.viewed_projects_count || 0,
        search_queries_count: activityDebugResponse.debug_info?.search_queries_count || 0,
        category_interests_count: activityDebugResponse.debug_info?.category_interests_count || 0,
        last_activity: activityDebugResponse.debug_info?.last_activity || 'Never',
        search_history: activityDebugResponse.user_activity?.search_queries || [],
        viewed_projects: activityDebugResponse.user_activity?.viewed_projects || [],
        category_interests: activityDebugResponse.user_activity?.category_interests || {},
        engagement_score: Math.min(100,
          (activityDebugResponse.debug_info?.viewed_projects_count || 0) * 10 +
          (activityDebugResponse.debug_info?.search_queries_count || 0) * 5 +
          (activityDebugResponse.debug_info?.category_interests_count || 0) * 15
        ),
        top_categories: Object.entries(activityDebugResponse.user_activity?.category_interests || {})
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      };

      setUserActivity(combinedActivity);

      // Calculate stats
      const totalRaised = projectsData.reduce((sum, project) =>
        sum + (project.total_donations || 0), 0
      );
      const totalDonated = donationsData.reduce((sum, donation) =>
        sum + (donation.amount || 0), 0
      );

      setStats({
        totalProjects: projectsData.length,
        totalRaised,
        totalDonated,
        totalDonations: donationsData.length
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      setMyProjects([]);
      setMyDonations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount || 0).replace('EGP', 'EGP');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCancelProject = async () => {
    if (!selectedProject || !cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      await projectsAPI.cancelProject(selectedProject.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedProject(null);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to cancel project:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  const getProjectStatus = (project) => {
    const progressPercentage = ((project.total_donations || 0) / (project.total_target || 1)) * 100;
    const daysRemaining = Math.ceil((new Date(project.end_time) - new Date()) / (1000 * 60 * 60 * 24));

    if (project.is_active === false) return { label: 'Cancelled', color: 'error' };
    if (daysRemaining <= 0) return { label: 'Ended', color: 'default' };
    if (progressPercentage >= 100) return { label: 'Funded', color: 'success' };
    return { label: 'Active', color: 'primary' };
  };

  const canCancelProject = (project) => {
    const progressPercentage = ((project.total_donations || 0) / (project.total_target || 1)) * 100;
    return progressPercentage < 25 && project.is_active !== false;
  };

  const handleMenuOpen = (event, project) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuProject(project);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuProject(null);
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleEditProject = (projectId) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const getMainImage = (project) => {
    if (project.pictures && project.pictures.length > 0) {
      const mainPic = project.pictures.find(pic => pic.is_main) || project.pictures[0];
      return mainPic.image_url || mainPic.image;
    }
    return '/placeholder-project.jpg';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.first_name || 'User'}! 👋
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's your personalized crowdfunding dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadDashboardData}
          sx={{
            mt: 2,
            borderColor: '#2C3E2D',
            color: '#2C3E2D',
            '&:hover': {
              borderColor: '#2C3E2D',
              backgroundColor: 'rgba(44, 62, 45, 0.04)'
            }
          }}
        >
          Refresh Activity
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Campaign sx={{ fontSize: 40, color: '#2C3E2D', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {stats.totalProjects}
            </Typography>
            <Typography color="text.secondary">Active Campaigns</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: '#00B964', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(stats.totalRaised)}
            </Typography>
            <Typography color="text.secondary">Total Raised</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Favorite sx={{ fontSize: 40, color: '#FF6B6B', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {stats.totalDonations}
            </Typography>
            <Typography color="text.secondary">Donations Made</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <AttachMoney sx={{ fontSize: 40, color: '#FFD93D', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(stats.totalDonated)}
            </Typography>
            <Typography color="text.secondary">Total Donated</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced User Activity Summary - DON'T MODIFY THIS SECTION */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
          Your Activity Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2C3E2D', fontWeight: 'bold' }}>
                {userActivity?.engagement_score || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📊 Engagement
              </Typography>
              <Typography variant="caption" display="block">
                Getting Started Activity
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#00B964', fontWeight: 'bold' }}>
                {userActivity?.viewed_projects_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                👁️ Projects Viewed
              </Typography>
              <Typography variant="caption" display="block">
                This session
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                {userActivity?.category_interests_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🏷️ Top Interests
              </Typography>
              <Typography variant="caption" display="block">
                {userActivity?.category_interests_count > 0 ? 'Categories explored' : 'Start exploring projects!'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Recent Searches ({userActivity?.search_queries_count || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {userActivity?.search_history?.slice(0, 3).map((search, index) => (
                  <Chip key={index} label={search} size="small" variant="outlined" />
                )) || (
                  <Typography variant="caption" color="text.secondary">
                    No recent searches
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>Categories Explored</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {userActivity?.top_categories?.slice(0, 3).map(([category, count], index) => (
                <Chip
                  key={index}
                  label={`${category} (${count})`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )) || (
                <Typography variant="caption" color="text.secondary">
                  Start exploring to see your interests
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">
              Categories Explored: {userActivity?.top_categories?.length || 0} •
              Searches Performed: {userActivity?.search_queries_count || 0} •
              Recommendation Type: Popular •
              Session Views: {userActivity?.viewed_projects_count || 0}
            </Typography>
            {rawActivityData && (
              <Typography variant="caption" display="block" color="text.secondary">
                Debug: Session {rawActivityData.session_key?.slice(-8)} •
                Modified: {rawActivityData.session_modified ? 'Yes' : 'No'} •
                Raw Views: {rawActivityData.user_activity?.viewed_projects?.length || 0}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="My Campaigns" icon={<Campaign />} />
          <Tab label="My Donations" icon={<MonetizationOn />} />
        </Tabs>
      </Box>

      {/* My Campaigns Tab - FIXED GRID LAYOUT */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Your Campaigns ({myProjects.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/projects/create')}
              sx={{
                background: 'linear-gradient(135deg, #00B964 0%, #00A855 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #00A855 0%, #009648 100%)' }
              }}
            >
              New Campaign
            </Button>
          </Box>

          {myProjects.length > 0 ? (
            <Grid container spacing={3}>
              {myProjects.map(project => {
                const status = getProjectStatus(project);
                const progressPercentage = ((project.total_donations || 0) / (project.total_target || 1)) * 100;
                const daysRemaining = Math.ceil((new Date(project.end_time) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ height: '100%' }}
                    >
                      <Card sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: 400,
                        mx: 'auto'
                      }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={getMainImage(project)}
                          alt={project.title}
                          onError={(e) => {
                            e.target.src = '/placeholder-project.jpg';
                          }}
                        />

                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
                              {project.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={status.label}
                                color={status.color}
                                size="small"
                              />
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, project)}
                              >
                                <MoreVert />
                              </IconButton>
                            </Box>
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {project.details?.substring(0, 100)}...
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Progress</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {progressPercentage.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(progressPercentage, 100)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: progressPercentage >= 100 ? '#4CAF50' : '#2C3E2D'
                                }
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Raised: {formatCurrency(project.total_donations)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Goal: {formatCurrency(project.total_target)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <People fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {project.donations_count || 0} backers
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewProject(project.id)}
                            variant="outlined"
                            sx={{ flex: 1 }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditProject(project.id)}
                            disabled={status.label !== 'Active'}
                            variant="outlined"
                            sx={{ flex: 1 }}
                          >
                            Edit
                          </Button>
                          {canCancelProject(project) && (
                            <Button
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => {
                                setSelectedProject(project);
                                setShowCancelModal(true);
                              }}
                              color="error"
                              variant="outlined"
                              sx={{ flex: 1 }}
                            >
                              Cancel
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Card sx={{ textAlign: 'center', p: 6 }}>
              <Campaign sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                You haven't created any campaigns yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start your first campaign and make a difference
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/projects/create')}
                sx={{
                  background: 'linear-gradient(135deg, #00B964 0%, #00A855 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #00A855 0%, #009648 100%)' }
                }}
              >
                Create Your First Campaign
              </Button>
            </Card>
          )}
        </Box>
      )}

      {/* My Donations Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Your Donations ({myDonations.length})
          </Typography>

          {myDonations.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myDonations.map(donation => (
                    <TableRow key={donation.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {donation.project_title || donation.project?.title || 'Unknown Project'}
                          </Typography>
                          {donation.project && (
                            <Typography variant="body2" color="text.secondary">
                              Goal: {formatCurrency(donation.project.total_target)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {formatCurrency(donation.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatDate(donation.donation_date || donation.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={donation.project?.is_active ? 'Active' : 'Completed'}
                          color={donation.project?.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewProject(donation.project_id || donation.project?.id)}
                        >
                          View Project
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card sx={{ textAlign: 'center', p: 6 }}>
              <MonetizationOn sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                You haven't made any donations yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Discover amazing campaigns and start supporting causes you care about
              </Typography>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={() => navigate('/projects')}
                sx={{
                  background: 'linear-gradient(135deg, #00B964 0%, #00A855 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #00A855 0%, #009648 100%)' }
                }}
              >
                Browse Campaigns
              </Button>
            </Card>
          )}
        </Box>
      )}

      {/* Project Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleViewProject(menuProject?.id);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Project
        </MenuItem>
        <MenuItem onClick={() => {
          handleEditProject(menuProject?.id);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={() => {
          navigator.share({
            title: menuProject?.title,
            url: `${window.location.origin}/projects/${menuProject?.id}`
          }).catch(() => {
            navigator.clipboard.writeText(`${window.location.origin}/projects/${menuProject?.id}`);
          });
          handleMenuClose();
        }}>
          <Share sx={{ mr: 1 }} />
          Share Project
        </MenuItem>
        {menuProject && canCancelProject(menuProject) && (
          <MenuItem onClick={() => {
            setSelectedProject(menuProject);
            setShowCancelModal(true);
            handleMenuClose();
          }}>
            <Cancel sx={{ mr: 1 }} />
            Cancel Project
          </MenuItem>
        )}
      </Menu>

      {/* Project Cancellation Modal */}
      <Dialog open={showCancelModal} onClose={() => setShowCancelModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Project</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. Your project will be permanently cancelled.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Current funding: {selectedProject ? ((selectedProject.total_donations || 0) / (selectedProject.total_target || 1) * 100).toFixed(1) : 0}% (Less than 25% threshold allows cancellation)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please explain why you're cancelling this project..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelModal(false)}>Cancel</Button>
          <Button
            onClick={handleCancelProject}
            color="error"
            variant="contained"
            disabled={!cancelReason.trim() || cancelLoading}
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
