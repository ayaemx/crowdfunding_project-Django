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
  useTheme
} from '@mui/material';
import { Add, TrendingUp, Favorite, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';

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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [projectsResponse, donationsResponse] = await Promise.all([
        authAPI.getMyProjects(),
        authAPI.getMyDonations()
      ]);

      setMyProjects(projectsResponse.data);
      setMyDonations(donationsResponse.data);

      // Calculate stats
      const totalRaised = projectsResponse.data.reduce((sum, project) =>
        sum + (project.total_donations || 0), 0
      );
      const totalDonated = donationsResponse.data.reduce((sum, donation) =>
        sum + donation.amount, 0
      );

      setStats({
        totalProjects: projectsResponse.data.length,
        totalRaised,
        totalDonated,
        totalDonations: donationsResponse.data.length
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
    }).format(amount).replace('EGP', 'EGP');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading dashboard...</Typography>
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
          Welcome back, {user?.first_name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your campaigns and track your impact
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
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

        <Grid item xs={6} md={3}>
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

        <Grid item xs={6} md={3}>
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

        <Grid item xs={6} md={3}>
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
                {myProjects.map(project => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <ProjectCard project={project} showAuthor={false} />
                  </Grid>
                ))}
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
                            {donation.project_title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(donation.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(donation.donation_date)}
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
    </Container>
  );
};

export default Dashboard;
