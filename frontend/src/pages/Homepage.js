import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { projectsAPI, categoriesAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const [homepageData, setHomepageData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load homepage data (top rated, latest, featured projects)
        const homepageResponse = await projectsAPI.getHomepageData();
        setHomepageData(homepageResponse.data);

        // Load categories
        const categoriesResponse = await categoriesAPI.getAll();
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading Egyptian Crowdfunding Projects...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Hero Section with Search */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom color="primary">
          Fund Dreams, Build Egypt's Future
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Discover and support innovative projects across Egypt
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search projects by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit" size="large">
            Search Projects
          </Button>
        </Box>
      </Box>

      {/* Top Rated Projects Slider */}
      {homepageData?.top_rated?.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom color="primary">
            🏆 Top Rated Projects
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The highest rated projects that are making a difference
          </Typography>
          <Grid container spacing={3}>
            {homepageData.top_rated.slice(0, 5).map(project => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Latest Projects */}
      {homepageData?.latest?.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom color="primary">
            🆕 Latest Projects
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Fresh ideas and new campaigns just launched
          </Typography>
          <Grid container spacing={3}>
            {homepageData.latest.slice(0, 5).map(project => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Featured Projects */}
      {homepageData?.featured?.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom color="primary">
            ⭐ Featured Projects
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Handpicked projects by our team
          </Typography>
          <Grid container spacing={3}>
            {homepageData.featured.slice(0, 5).map(project => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom color="primary">
            📂 Browse by Category
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Explore projects in different sectors
          </Typography>
          <Grid container spacing={2}>
            {categories.map(category => (
              <Grid item xs={6} sm={4} md={3} key={category.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                  onClick={() => navigate(`/categories/${category.slug}`)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6">
                      {category.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Homepage;
