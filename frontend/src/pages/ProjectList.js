import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Pagination,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Search } from '@mui/icons-material'; // Removed FilterList
import { projectsAPI, categoriesAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';

const ProjectList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(slug || '');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Memoize loadProjects function to prevent unnecessary re-renders
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        search: searchQuery,
        category: selectedCategory || slug,
        ordering: sortBy === 'latest' ? '-created_at' :
                 sortBy === 'popular' ? '-total_donations' :
                 sortBy === 'ending' ? 'end_time' : '-created_at'
      };

      const response = await projectsAPI.getAll(params);
      setProjects(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / 12));

    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, page, slug]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search: searchQuery });
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('latest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          fontWeight="bold"
          gutterBottom
        >
          {slug ? `${categories.find(c => c.slug === slug)?.name || 'Category'} Campaigns` : 'Discover Campaigns'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Support the causes and projects that matter to you
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          border: '1px solid #E5E7EB',
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.slug}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="popular">Most Funded</MenuItem>
                <MenuItem value="ending">Ending Soon</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
              />
            )}
            {selectedCategory && (
              <Chip
                label={categories.find(c => c.slug === selectedCategory)?.name}
                onDelete={() => setSelectedCategory('')}
                size="small"
              />
            )}
            <Button size="small" onClick={clearFilters}>
              Clear all
            </Button>
          </Box>
        )}
      </Paper>

      {/* Projects Grid */}
      {loading ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Loading campaigns...
          </Typography>
        </Box>
      ) : projects.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {projects.map(project => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            border: '1px solid #E5E7EB',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            No campaigns found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filters to find what you're looking for.
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear filters
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default ProjectList;
