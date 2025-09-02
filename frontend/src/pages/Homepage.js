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
  useMediaQuery,
  useTheme,
  Paper,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import {
  Search,
  Rocket,
  ArrowForward,
  VolunteerActivism,
  TrendingUp,
  Timeline,
  EmojiEvents,
  LocalOffer,
  Favorite,
  Groups,
  AutoAwesome,
  Star,
  TrendingUpOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { projectsAPI, categoriesAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';

// Elegant floating elements inspired by Arnica
const MinimalFloatingElements = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 1,
        opacity: 0.4
      }}
    >
      {/* Gentle floating circles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`circle-${i}`}
          style={{
            position: 'absolute',
            width: Math.random() * 40 + 20,
            height: Math.random() * 40 + 20,
            borderRadius: '50%',
            background: `linear-gradient(135deg, rgba(44, 62, 45, 0.1) 0%, rgba(74, 107, 77, 0.05) 100%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, Math.random() * 10 - 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Subtle leaf-like shapes */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          style={{
            position: 'absolute',
            width: 30,
            height: 15,
            borderRadius: '50% 0',
            background: 'rgba(44, 62, 45, 0.08)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            rotate: [0, 360],
            y: [0, -10, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </Box>
  );
};

const Homepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [homepageData, setHomepageData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
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
    // ADDED: Track search activity
    console.log('🔍 Tracking search query:', searchQuery);

    // Track search via API call
    fetch(`http://127.0.0.1:8000/api/projects/?search=${encodeURIComponent(searchQuery)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(() => {
      console.log('✅ Search activity tracked successfully');
    }).catch((error) => {
      console.log('⚠️ Search tracking failed:', error);
    });

    navigate(`/projects?search=${searchQuery}`);
  }
};

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #FEFEFE 0%, #F8F6F3 100%)'
      }}>
        <Typography variant="h6" sx={{
          color: '#2C3E2D',
          fontFamily: '"Inter", sans-serif',
          fontWeight: 500
        }}>
          Loading amazing projects...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FEFEFE 0%, #F8F6F3 50%, #F5F2EE 100%)'
    }}>
      {/* COMPACT HERO SECTION - Much Shorter */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2C3E2D 0%, #3D5A3F 50%, #4A6B4D 100%)',
          color: 'white',
          py: { xs: 3, md: 4 }, // MUCH SMALLER
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '40vh', md: '45vh' }, // MUCH SHORTER
        }}
      >
        <MinimalFloatingElements />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            {/* Centered Content - More Compact */}
            <Grid item xs={12} md={10} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 800,
                      fontSize: { xs: '1.8rem', md: '2.4rem' }, // SMALLER
                      lineHeight: 1.2,
                      mb: 1.5, // REDUCED margin
                      color: 'white',
                    }}
                  >
                    Fund Dreams,{' '}
                    <Box component="span" sx={{
                      background: 'linear-gradient(45deg, #D4A574 30%, #E8C4A0 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 900
                    }}>
                      Build Future
                    </Box>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 400,
                      mb: 2.5, // REDUCED margin
                      opacity: 0.95,
                      fontSize: { xs: '1rem', md: '1.1rem' }, // SMALLER text
                      lineHeight: 1.5,
                      maxWidth: '500px', // NARROWER
                      mx: 'auto'
                    }}
                  >
                    Join Egypt's most trusted crowdfunding platform where innovation meets community support.
                  </Typography>

                  {/* Compact CTA Buttons */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="center"
                    sx={{ mb: 2 }} // REDUCED margin
                  >
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="contained"
                        size="medium" // SMALLER size
                        startIcon={<Rocket />}
                        onClick={() => navigate('/projects/create')}
                        sx={{
                          background: 'linear-gradient(135deg, #D4A574 0%, #C19660 100%)',
                          color: 'white',
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 700,
                          px: 3, // REDUCED padding
                          py: 1.2,
                          borderRadius: 3,
                          fontSize: '0.95rem', // SMALLER font
                          textTransform: 'none',
                          boxShadow: '0 4px 16px rgba(212, 165, 116, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #C19660 0%, #B8956A 100%)',
                            boxShadow: '0 6px 20px rgba(212, 165, 116, 0.4)'
                          }
                        }}
                      >
                        Start Campaign
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outlined"
                        size="medium" // SMALLER size
                        startIcon={<Search />}
                        onClick={() => navigate('/projects')}
                        sx={{
                          borderColor: 'rgba(255,255,255,0.8)',
                          color: 'white',
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 700,
                          px: 3, // REDUCED padding
                          py: 1.2,
                          borderRadius: 3,
                          fontSize: '0.95rem', // SMALLER font
                          textTransform: 'none',
                          borderWidth: '1.5px',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderColor: 'white',
                            borderWidth: '1.5px'
                          }
                        }}
                      >
                        Explore Projects
                      </Button>
                    </motion.div>
                  </Stack>

                  {/* Compact Stats */}
                  <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}> {/* REDUCED spacing and margin */}
                    <Grid item xs={4} sm={2}>
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Typography variant="h6" sx={{ // SMALLER stats
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 700,
                          mb: 0.2,
                          fontSize: '1.2rem' // SMALLER
                        }}>
                          {homepageData?.latest?.length || 12}+
                        </Typography>
                        <Typography variant="caption" sx={{
                          opacity: 0.9,
                          fontSize: '0.75rem' // SMALLER
                        }}>
                          Projects
                        </Typography>
                      </motion.div>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Typography variant="h6" sx={{
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 700,
                          mb: 0.2,
                          fontSize: '1.2rem' // SMALLER
                        }}>
                          50K+
                        </Typography>
                        <Typography variant="caption" sx={{
                          opacity: 0.9,
                          fontSize: '0.75rem' // SMALLER
                        }}>
                          Supporters
                        </Typography>
                      </motion.div>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Typography variant="h6" sx={{
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 700,
                          mb: 0.2,
                          fontSize: '1.2rem' // SMALLER
                        }}>
                          2M+
                        </Typography>
                        <Typography variant="caption" sx={{
                          opacity: 0.9,
                          fontSize: '0.75rem' // SMALLER
                        }}>
                          EGP Raised
                        </Typography>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ENHANCED: Featured Projects Section */}
      {homepageData?.top_rated?.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 800,
                  color: '#2C3E2D',
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}
              >
                <EmojiEvents sx={{ fontSize: 'inherit', color: '#D4A574', mr: 2 }} />
                Most Trusted Campaigns
              </Typography>
              <Typography variant="h6" sx={{
                color: '#5A6B5D',
                maxWidth: 600,
                mx: 'auto',
                fontFamily: '"Inter", sans-serif'
              }}>
                Projects that have earned the trust and support of our community
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {homepageData.top_rated.slice(0, 3).map((project, index) => (
                <Grid item xs={12} sm={6} lg={4} key={project.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProjectCard
                      project={project}
                      variant="featured"
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      )}

      {/* ENHANCED: Latest Projects Section */}
      {homepageData?.latest?.length > 0 && (
        <Box sx={{ backgroundColor: 'rgba(248, 246, 243, 0.6)', py: 6 }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 800,
                    color: '#2C3E2D',
                    mb: 2,
                    fontSize: { xs: '1.8rem', md: '2.2rem' }
                  }}
                >
                  <Timeline sx={{ fontSize: 'inherit', color: '#4A6B4D', mr: 2 }} />
                  Fresh Starts
                </Typography>
                <Typography variant="h6" sx={{
                  color: '#5A6B5D',
                  maxWidth: 600,
                  mx: 'auto',
                  fontFamily: '"Inter", sans-serif'
                }}>
                  New campaigns just beginning their journey to success
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {homepageData.latest.slice(0, 6).map((project, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={project.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <ProjectCard
                        project={project}
                        variant="latest"
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 5 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/projects')}
                    sx={{
                      borderColor: '#2C3E2D',
                      color: '#2C3E2D',
                      fontWeight: 700,
                      fontFamily: '"Inter", sans-serif',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1rem',
                      textTransform: 'none',
                      borderWidth: '2px',
                      '&:hover': {
                        bgcolor: '#2C3E2D',
                        color: 'white',
                        borderWidth: '2px'
                      }
                    }}
                  >
                    View All Projects
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Container>
        </Box>
      )}

      {/* ENHANCED: Categories Section */}
      {categories.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 800,
                  color: '#2C3E2D',
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}
              >
                <LocalOffer sx={{ fontSize: 'inherit', color: '#D4A574', mr: 2 }} />
                Explore Categories
              </Typography>
              <Typography variant="h6" sx={{
                color: '#5A6B5D',
                maxWidth: 600,
                mx: 'auto',
                fontFamily: '"Inter", sans-serif'
              }}>
                Find causes and projects that resonate with your values
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {categories.slice(0, 8).map((category, index) => (
                <Grid item xs={6} sm={4} md={3} key={category.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderRadius: 3,
                        border: '1px solid #E8F4EA',
                        background: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(44, 62, 45, 0.15)',
                          borderColor: '#2C3E2D',
                          background: 'white'
                        }
                      }}
                      onClick={() => navigate(`/categories/${category.slug}`)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#2C3E2D',
                            fontSize: '0.95rem',
                            fontFamily: '"Inter", sans-serif'
                          }}
                        >
                          {category.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      )}

      {/* Call to Action Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2C3E2D 0%, #3D5A3F 50%, #4A6B4D 100%)',
          color: 'white',
          py: 6,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Ready to Make a Difference?
            </Typography>
            <Typography variant="h6" sx={{
              mb: 4,
              opacity: 0.95,
              fontFamily: '"Inter", sans-serif',
              maxWidth: 500,
              mx: 'auto'
            }}>
              Join thousands of creators and supporters who are turning ideas into reality
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Rocket />}
                  onClick={() => navigate('/projects/create')}
                  sx={{
                    background: 'linear-gradient(135deg, #D4A574 0%, #C19660 100%)',
                    fontWeight: 700,
                    fontFamily: '"Inter", sans-serif',
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #C19660 0%, #B8956A 100%)'
                    }
                  }}
                >
                  Start Your Project
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<VolunteerActivism />}
                  onClick={() => navigate('/projects')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.8)',
                    color: 'white',
                    fontWeight: 700,
                    fontFamily: '"Inter", sans-serif',
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderWidth: '2px',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderWidth: '2px'
                    }
                  }}
                >
                  Support Projects
                </Button>
              </motion.div>
            </Stack>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
