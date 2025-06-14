import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Paper,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  Search,
  Rocket,
  Star,
  ArrowForward,
  VolunteerActivism,
  People,
  Add,
  Person
} from '@mui/icons-material';
// REMOVED: CardMedia, TrendingUp, AccessTime (unused imports)

import { projectsAPI, categoriesAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [homepageData, setHomepageData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [latestPage, setLatestPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [homepageResponse, categoriesResponse] = await Promise.all([
          projectsAPI.getHomepageData(),
          categoriesAPI.getAll()
        ]);

        setHomepageData(homepageResponse.data);
        setCategories(categoriesResponse.data);

      } catch (error) {
        console.error('Failed to load homepage data:', error);
        setHomepageData({ top_rated: [], latest: [], featured: [] });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${searchQuery}`);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const getLatestProjectsPage = () => {
    const projects = homepageData?.latest || [];
    const startIndex = latestPage * 3;
    return projects.slice(startIndex, startIndex + 3);
  };

  const getTotalLatestPages = () => {
    const projects = homepageData?.latest || [];
    return Math.ceil(projects.length / 3);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount).replace('EGP', 'EGP');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-project.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://127.0.0.1:8000${imagePath}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="#4A5D4A">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FDF8', minHeight: '100vh' }}>
      {/* Enhanced Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `,
            animation: 'float 6s ease-in-out infinite'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Side - Content */}
            <Grid xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderRadius: 3,
                      p: 1.5,
                      mr: 2,
                      backdropFilter: 'blur(10px)'
                    }}>
                      <VolunteerActivism sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontFamily: '"Cairo", sans-serif' }}>
                      الخير فينا جميعاً
                    </Typography>
                  </Box>

                  <Typography
                    variant={isMobile ? "h3" : "h2"}
                    fontWeight="bold"
                    gutterBottom
                    sx={{ mb: 2, lineHeight: 1.2 }}
                  >
                    Fund Dreams,
                    <br />
                    Build Tomorrow
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{ mb: 4, opacity: 0.9, fontWeight: 300, lineHeight: 1.5 }}
                  >
                    Join Egypt's most trusted crowdfunding platform.
                    Turn innovative ideas into reality with community support.
                  </Typography>

                  {/* Enhanced CTA Buttons */}
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: isMobile ? 'column' : 'row' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      onClick={() => navigate('/projects/create')}
                      sx={{
                        bgcolor: 'white',
                        color: '#00A86B',
                        fontWeight: 'bold',
                        px: 5,
                        py: 2,
                        borderRadius: 4,
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 24px rgba(255,255,255,0.3)',
                        border: '2px solid transparent',
                        '&:hover': {
                          bgcolor: '#F8FDF8',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px rgba(255,255,255,0.4)'
                        }
                      }}
                    >
                      Start Your Campaign Now
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/projects')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 'bold',
                        px: 4,
                        py: 2,
                        borderRadius: 4,
                        fontSize: '1.1rem',
                        borderWidth: '2px',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderColor: 'white',
                          borderWidth: '2px',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Explore Projects
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Right Side - Search & Stats */}
            <Grid xs={12} md={6}>
              <Fade in timeout={1200}>
                <Box>
                  {/* Search Bar */}
                  <Paper
                    component="form"
                    onSubmit={handleSearch}
                    elevation={12}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 5,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      mb: 4,
                      boxShadow: '0 8px 32px rgba(0, 168, 107, 0.2)'
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Search for meaningful projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: '#00A86B', ml: 1, fontSize: '1.5rem' }} />
                          </InputAdornment>
                        ),
                        sx: { px: 2, py: 1.5, color: '#2E3B2E', fontSize: '1.1rem' }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
                        borderRadius: 4,
                        px: 4,
                        py: 1.5,
                        minWidth: 'auto'
                      }}
                    >
                      <ArrowForward sx={{ fontSize: '1.3rem' }} />
                    </Button>
                  </Paper>

                  {/* Quick Stats */}
                  <Grid container spacing={3}>
                    <Grid xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold">
                          {homepageData?.latest?.length || 5}+
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Active Projects
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold">
                          50K+
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Supporters
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold">
                          2M+
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          EGP Raised
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Top Rated Projects */}
        {homepageData?.top_rated?.length > 0 && (
          <Slide direction="up" in timeout={800}>
            <Box sx={{ mb: 12 }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Star sx={{ color: '#FFB300', fontSize: 40, mr: 2 }} />
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color="#2E3B2E">
                    Most Trusted Campaigns
                  </Typography>
                </Box>
                <Typography variant="h6" color="#4A5D4A" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Projects that have earned the trust and support of our community
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                pb: 2,
                '&::-webkit-scrollbar': { height: 8 },
                '&::-webkit-scrollbar-track': { bgcolor: '#E8F5E8', borderRadius: 4 },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
                  borderRadius: 4
                }
              }}>
                {homepageData.top_rated.slice(0, 5).map((project, index) => (
                  <Fade in timeout={1000 + index * 200} key={project.id}>
                    <Box sx={{ minWidth: { xs: 300, sm: 350 }, maxWidth: { xs: 300, sm: 350 } }}>
                      <ProjectCard
                        project={project}
                        onClick={() => handleProjectClick(project.id)}
                        variant="standard"
                      />
                    </Box>
                  </Fade>
                ))}
              </Box>
            </Box>
          </Slide>
        )}

        {/* Fresh Starts - COMPLETELY REDESIGNED */}
        {homepageData?.latest?.length > 0 && (
          <Slide direction="up" in timeout={1000}>
            <Box sx={{ mb: 12 }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Rocket sx={{ color: '#4CAF50', fontSize: 40, mr: 2 }} />
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color="#2E3B2E">
                    Fresh Starts
                  </Typography>
                </Box>
                <Typography variant="h6" color="#4A5D4A" sx={{ maxWidth: 600, mx: 'auto' }}>
                  New campaigns just beginning their journey
                </Typography>
              </Box>

              {/* Redesigned Fresh Starts Cards */}
              <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                {getLatestProjectsPage().map((project, index) => (
                  <Fade in timeout={1200 + index * 200} key={project.id}>
                    <Card
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        mb: 3,
                        borderRadius: 4,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '1px solid #E8F5E8',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 32px rgba(0, 168, 107, 0.15)',
                          border: '1px solid #00A86B'
                        }
                      }}
                      onClick={() => handleProjectClick(project.id)}
                    >
                      {/* Image Section - Fixed Size */}
                      <Box
                        sx={{
                          width: { xs: '100%', md: 250 },
                          height: { xs: 200, md: 180 },
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${getImageUrl(project.pictures?.[0]?.image)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />

                        {/* NEW Badge */}
                        <Chip
                          label="NEW"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: '#4CAF50',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />

                        {/* Progress Badge */}
                        <Chip
                          label={`${((project.total_donations / project.total_target) * 100).toFixed(0)}%`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: '#00A86B',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>

                      {/* Content Section */}
                      <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold" color="#2E3B2E" sx={{ flex: 1, mr: 2 }}>
                            {project.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star sx={{ color: '#FFB300', fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" fontWeight="bold">
                              {project.average_rating?.toFixed(1) || '0.0'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Description */}
                        <Typography variant="body2" color="#4A5D4A" sx={{ mb: 2, lineHeight: 1.5, flex: 1 }}>
                          {project.details?.substring(0, 150)}...
                        </Typography>

                        {/* Author */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            <Person fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="#4A5D4A">
                            by {project.user?.first_name} {project.user?.last_name}
                          </Typography>
                        </Box>

                        {/* Stats and Action */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" color="#00A86B">
                              {formatCurrency(project.total_donations)} raised
                            </Typography>
                            <Typography variant="body2" color="#4A5D4A">
                              of {formatCurrency(project.total_target)} goal
                            </Typography>
                          </Box>

                          <Button
                            variant="contained"
                            size="medium"
                            sx={{
                              background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
                              borderRadius: 3,
                              px: 3,
                              fontWeight: 'bold'
                            }}
                          >
                            Support Now
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Box>

              {/* Pagination */}
              {getTotalLatestPages() > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
                  {Array.from({ length: getTotalLatestPages() }, (_, index) => (
                    <IconButton
                      key={index}
                      onClick={() => setLatestPage(index)}
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: latestPage === index ? '#00A86B' : '#E8F5E8',
                        '&:hover': { bgcolor: latestPage === index ? '#00695C' : '#C8E6C9' },
                        borderRadius: '50%'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Slide>
        )}

        {/* Community Favorites - Standard Grid */}
        {homepageData?.featured?.length > 0 && (
          <Slide direction="up" in timeout={1200}>
            <Box sx={{ mb: 10 }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <People sx={{ color: '#26A69A', fontSize: 40, mr: 2 }} />
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color="#2E3B2E">
                    Community Favorites
                  </Typography>
                </Box>
                <Typography variant="h6" color="#4A5D4A" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Exceptional projects making a real difference
                </Typography>
              </Box>

              <Grid container spacing={4} justifyContent="center">
                {homepageData.featured.slice(0, 3).map((project, index) => (
                  <Grid xs={12} sm={6} md={4} key={project.id}>
                    <Fade in timeout={1400 + index * 200}>
                      <Box>
                        <ProjectCard
                          project={project}
                          onClick={() => handleProjectClick(project.id)}
                          variant="standard"
                        />
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Slide>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <Slide direction="up" in timeout={1400}>
            <Box sx={{ mb: 8 }}>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" gutterBottom align="center" color="#2E3B2E" sx={{ mb: 2 }}>
                Explore Categories
              </Typography>
              <Typography variant="h6" color="#4A5D4A" align="center" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                Find causes that resonate with your values
              </Typography>

              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {categories.map((category, index) => (
                  <Fade in timeout={1600 + index * 100} key={category.id}>
                    <Chip
                      label={category.name}
                      onClick={() => navigate(`/categories/${category.slug}`)}
                      sx={{
                        fontSize: '1rem',
                        py: 3,
                        px: 4,
                        bgcolor: '#E8F5E8',
                        color: '#4A5D4A',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#00A86B',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(0, 168, 107, 0.25)'
                        }
                      }}
                    />
                  </Fade>
                ))}
              </Box>
            </Box>
          </Slide>
        )}
      </Container>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
};

export default Homepage;
