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
  CircularProgress
} from '@mui/material';
import { Add, TrendingUp, Favorite, AttachMoney, Cancel, Edit, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, projectsAPI } from '../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [myProjects, setMyProjects] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Loading dashboard data...');

      // Load user's projects and donations
      const [projectsResponse, donationsResponse] = await Promise.all([
        authAPI.getMyProjects(),
        authAPI.getMyDonations()
      ]);

      console.log('Projects response:', projectsResponse.data);
      console.log('Donations response:', donationsResponse.data);

      // Handle different response formats
      const projectsData = projectsResponse.data?.results || projectsResponse.data || [];
      const donationsData = donationsResponse.data?.results || donationsResponse.data || [];

      setMyProjects(Array.isArray(projectsData) ? projectsData : []);
      setMyDonations(Array.isArray(donationsData) ? donationsData : []);

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
      // Set empty arrays to prevent crashes
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

  // Project cancellation logic (PDF requirement: cancel if <25% funded)
  const handleCancelProject = async () => {
    if (!selectedProject || !cancelReason.trim()) return;

    setCancelLoading(true);
    try {
      await projectsAPI.cancelProject(selectedProject.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedProject(null);
      loadDashboardData(); // Refresh data
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          fontWeight="bold"
          gutterBottom
        >
          Welcome back, {user?.first_name || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your campaigns and track your impact
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#00B964', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.totalProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: '#00B964', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {formatCurrency(stats.totalRaised)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Raised
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Favorite sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="secondary">
                {stats.totalDonations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Donations Made
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="secondary">
                {formatCurrency(stats.totalDonated)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Donated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="My Campaigns" />
          <Tab label="My Donations" />
        </Tabs>

        {/* My Campaigns Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Your Campaigns ({myProjects.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/projects/create')}
                sx={{ bgcolor: '#00B964', '&:hover': { bgcolor: '#00A855' } }}
              >
                New Campaign
              </Button>
            </Box>

            {myProjects.length > 0 ? (
              <Grid container spacing={3}>
                {myProjects.map(project => {
                  const status = getProjectStatus(project);
                  const progressPercentage = ((project.total_donations || 0) / (project.total_target || 1)) * 100;

                  return (
                    <Grid xs={12} sm={6} md={4} key={project.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Chip
                              label={status.label}
                              color={status.color}
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {progressPercentage.toFixed(1)}% funded
                            </Typography>
                          </Box>

                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {project.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {formatCurrency(project.total_donations)} / {formatCurrency(project.total_target)}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => navigate(`/projects/${project.id}`)}
                            >
                              View
                            </Button>

                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => navigate(`/projects/${project.id}/edit`)}
                              disabled={status.label !== 'Active'}
                            >
                              Edit
                            </Button>

                            {canCancelProject(project) && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowCancelModal(true);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  You haven't created any campaigns yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Start your first campaign and make a difference
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/projects/create')}
                  sx={{ bgcolor: '#00B964', '&:hover': { bgcolor: '#00A855' } }}
                >
                  Create Your First Campaign
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* My Donations Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Your Donations ({myDonations.length})
            </Typography>

            {myDonations.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myDonations.map(donation => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {donation.project_title || donation.project?.title || 'Unknown Project'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(donation.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(donation.donation_date || donation.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Completed"
                            color="success"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  You haven't made any donations yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Discover amazing campaigns and start supporting causes you care about
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/projects')}
                  sx={{ bgcolor: '#00B964', '&:hover': { bgcolor: '#00A855' } }}
                >
                  Browse Campaigns
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Project Cancellation Modal */}
      <Dialog
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Project</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This action cannot be undone. Your project will be permanently cancelled.
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Project: <strong>{selectedProject.title}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Current funding: {(((selectedProject.total_donations || 0) / (selectedProject.total_target || 1)) * 100).toFixed(1)}%
                (Less than 25% threshold allows cancellation)
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCancelProject}
            color="error"
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
