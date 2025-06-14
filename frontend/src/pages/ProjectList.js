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
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Search, FilterList, ExpandMore } from '@mui/icons-material';
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

  // Enhanced search filters (PDF requirement: search by title or tag)
  const [advancedFilters, setAdvancedFilters] = useState({
    title: searchParams.get('title') || '',
    tags: searchParams.get('tags') || '',
    minAmount: searchParams.get('min_target') || '',
    maxAmount: searchParams.get('max_target') || '',
    status: searchParams.get('status') || 'active'
  });

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        search: searchQuery,
        category: selectedCategory || slug,
        ordering: sortBy === 'latest' ? '-created_at' :
                 sortBy === 'popular' ? '-total_donations' :
                 sortBy === 'ending' ? 'end_time' :
                 sortBy === 'rating' ? '-average_rating' : '-created_at',
        // Advanced search parameters
        title: advancedFilters.title,
        tags: advancedFilters.tags,
        min_target: advancedFilters.minAmount,
        max_target: advancedFilters.maxAmount,
        status: advancedFilters.status
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      console.log('Loading projects with params:', params);
      const response = await projectsAPI.getAll(params);

      // Handle different response formats and remove duplicates
      let projectsData = response.data.results || response.data || [];

      // Remove duplicates by ID
      const uniqueProjects = projectsData.filter((project, index, self) =>
        index === self.findIndex(p => p.id === project.id)
      );

      setProjects(uniqueProjects);
      setTotalPages(Math.ceil((response.data.count || uniqueProjects.length) / 12));

    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, page, slug, advancedFilters]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getAll();
      const categoriesData = response.data.results || response.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
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

  // Enhanced search function (PDF requirement)
  const handleAdvancedSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (advancedFilters.title) params.append('title', advancedFilters.title);
    if (advancedFilters.tags) params.append('tags', advancedFilters.tags);
    if (advancedFilters.minAmount) params.append('min_target', advancedFilters.minAmount);
    if (advancedFilters.maxAmount) params.append('max_target', advancedFilters.maxAmount);
    if (advancedFilters.status) params.append('status', advancedFilters.status);

    setSearchParams(params);
    setPage(1);
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
    setAdvancedFilters({
      title: '',
      tags: '',
      minAmount: '',
      maxAmount: '',
      status: 'active'
    });
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory ||
    advancedFilters.title || advancedFilters.tags ||
    advancedFilters.minAmount || advancedFilters.maxAmount;

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
        {/* Basic Search */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid xs={12} md={6}>
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

          <Grid xs={12} sm={6} md={3}>
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

          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="popular">Most Funded</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="ending">Ending Soon</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Advanced Search Accordion */}
        <Accordion elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterList sx={{ mr: 1 }} />
              <Typography>Advanced Search</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="form" onSubmit={handleAdvancedSearch}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Search by Title"
                    value={advancedFilters.title}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title..."
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Search by Tags"
                    value={advancedFilters.tags}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags (comma separated)..."
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Min Funding Goal (EGP)"
                    type="number"
                    value={advancedFilters.minAmount}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    placeholder="0"
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Funding Goal (EGP)"
                    type="number"
                    value={advancedFilters.maxAmount}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    placeholder="1000000"
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Project Status</InputLabel>
                    <Select
                      value={advancedFilters.status}
                      label="Project Status"
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="ended">Ended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#00B964',
                      '&:hover': { bgcolor: '#00A855' },
                      height: '56px'
                    }}
                  >
                    Apply Advanced Search
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Active Filters - FIXED: Complete the Chip element */}
        {hasActiveFilters && (
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
            {advancedFilters.title && (
              <Chip
                label={`Title: "${advancedFilters.title}"`}
                onDelete={() => setAdvancedFilters(prev => ({ ...prev, title: '' }))}
                size="small"
              />
            )}
            {advancedFilters.tags && (
              <Chip
                label={`Tags: "${advancedFilters.tags}"`}
                onDelete={() => setAdvancedFilters(prev => ({ ...prev, tags: '' }))}
                size="small"
              />
            )}
            <Button size="small" onClick={clearFilters}>
              Clear all
            </Button>
          </Box>
        )}
      </Paper>

      {/* Projects Grid - FIXED: Removed deprecated 'item' prop */}
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
              <Grid xs={12} sm={6} md={4} lg={3} key={project.id}>
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
