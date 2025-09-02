import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  Insights,
  Favorite,
  Star,
  Timeline,
  Category,
  Search,
  MonetizationOn,
  Refresh,
  Analytics,
  PersonalVideo
} from '@mui/icons-material';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from './ProjectCard';

const PersonalizedDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setAnalyticsError(false);

      // Always fetch dashboard data first
      const dashboardResponse = await projectsAPI.getPersonalizedDashboard();
      setDashboardData(dashboardResponse.data);

      // Try to fetch analytics, but don't fail if it doesn't work
      try {
        const analyticsResponse = await projectsAPI.getAnalyticsDashboard();
        setAnalytics(analyticsResponse.data);
      } catch (analyticsErr) {
        console.warn('Analytics failed to load:', analyticsErr);
        setAnalyticsError(true);
        // Create fallback analytics data
        setAnalytics({
          user_engagement: {
            active_sessions: 1,
            page_views_per_session: dashboardResponse.data?.user_insights?.viewed_projects_count || 0,
            categories_explored: dashboardResponse.data?.activity_summary?.categories_explored || 0,
            engagement_level: 'new'
          },
          campaign_performance: {
            total_campaigns: 'Loading...',
            funded_campaigns: 'Loading...',
            success_rate: 'Loading...',
            avg_funding_percentage: 'Loading...'
          },
          platform_activity: {
            recent_donations_7days: 'Loading...',
            new_projects_7days: 'Loading...',
            total_active_projects: 'Loading...',
            platform_health: 'Loading...'
          }
        });
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load personalized dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (score) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getEngagementLevel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Getting Started';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount).replace('EGP', 'EGP');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your personalized dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back{isAuthenticated ? `, ${user?.first_name}` : ''}! 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's your personalized crowdfunding dashboard
          </Typography>
        </Box>
        <IconButton onClick={fetchDashboardData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Analytics Error Warning */}
      {analyticsError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some analytics features are temporarily unavailable. Your personalized recommendations are still working!
        </Alert>
      )}

      {/* User Insights Cards */}
      {dashboardData?.user_insights && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Engagement Score */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Insights color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Engagement</Typography>
                </Box>
                <Typography variant="h4" color={getEngagementColor(dashboardData.user_insights.engagement_score)}>
                  {dashboardData.user_insights.engagement_score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getEngagementLevel(dashboardData.user_insights.engagement_score)} Activity
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.user_insights.engagement_score}
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#E0E0E0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getEngagementColor(dashboardData.user_insights.engagement_score)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Projects Viewed */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Timeline color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Projects Viewed</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {dashboardData.user_insights.viewed_projects_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This session
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Donation Stats */}
          {dashboardData.user_insights.donation_stats && (
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MonetizationOn color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Donated</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(dashboardData.user_insights.donation_stats.total_donated)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.user_insights.donation_stats.donation_count} donations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Top Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Category color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Top Interests</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dashboardData.user_insights.top_categories.slice(0, 3).map(([category, count], index) => (
                    <Chip
                      key={category}
                      label={`${category} (${count})`}
                      size="small"
                      color={index === 0 ? 'primary' : 'default'}
                      variant={index === 0 ? 'filled' : 'outlined'}
                    />
                  ))}
                  {dashboardData.user_insights.top_categories.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Start exploring projects!
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Activity Summary */}
      {dashboardData?.activity_summary && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Analytics color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Your Activity Summary</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Categories Explored</Typography>
                <Typography variant="h6">{dashboardData.activity_summary.categories_explored}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Searches Performed</Typography>
                <Typography variant="h6">{dashboardData.activity_summary.searches_performed}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Recommendation Type</Typography>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {dashboardData.activity_summary.recommendation_basis}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Session Views</Typography>
                <Typography variant="h6">{dashboardData.activity_summary.session_projects_viewed}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {dashboardData?.personalized_recommendations && dashboardData.personalized_recommendations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Star color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">
              Recommended for You
            </Typography>
            <Chip
              label={`${dashboardData.personalized_recommendations.length} projects`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          </Box>
          <Grid container spacing={3}>
            {dashboardData.personalized_recommendations.slice(0, 4).map(project => (
              <Grid item xs={12} sm={6} md={3} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Trending in Your Interests */}
      {dashboardData?.trending_in_interests && dashboardData.trending_in_interests.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">
              Trending in Your Interests
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {dashboardData.trending_in_interests.slice(0, 4).map(project => (
              <Grid item xs={12} sm={6} md={3} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Similar to Viewed */}
      {dashboardData?.similar_to_viewed && dashboardData.similar_to_viewed.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Similar to Projects You've Viewed
          </Typography>
          <Grid container spacing={3}>
            {dashboardData.similar_to_viewed.slice(0, 4).map(project => (
              <Grid item xs={12} sm={6} md={3} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Platform Analytics - Only show if analytics loaded successfully */}
      {analytics && !analyticsError && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Platform Insights
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Campaign Performance</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Success Rate:</Typography>
                    <Typography color="success.main" fontWeight="bold">
                      {analytics.campaign_performance.success_rate}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Total Campaigns:</Typography>
                    <Typography>{analytics.campaign_performance.total_campaigns}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Funded Campaigns:</Typography>
                    <Typography>{analytics.campaign_performance.funded_campaigns}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Your Activity</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Engagement Level:</Typography>
                    <Typography color="primary" fontWeight="bold">
                      {analytics.user_engagement.engagement_level}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Categories Explored:</Typography>
                    <Typography>{analytics.user_engagement.categories_explored}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Active Sessions:</Typography>
                    <Typography>{analytics.user_engagement.active_sessions}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Search History */}
      {dashboardData?.user_insights?.search_history && dashboardData.user_insights.search_history.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Search color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Searches</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {dashboardData.user_insights.search_history.map((query, index) => (
                  <Chip
                    key={index}
                    label={query}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default PersonalizedDashboard;
