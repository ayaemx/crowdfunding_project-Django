import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  InputAdornment,
  Chip,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Switch
} from '@mui/material';
import { CloudUpload, AttachMoney, Add, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, categoriesAPI, tagsAPI } from '../services/api';

const CreateProject = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    details: '',
    total_target: '',
    category: '',
    start_time: '',
    end_time: '',
    is_featured: false
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [images, setImages] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      console.log('Loading categories and tags...');

      const [categoriesResponse, tagsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        tagsAPI.getAll()
      ]);

      // Handle paginated response from Django
      const categoriesData = categoriesResponse.data.results || categoriesResponse.data;
      const tagsData = tagsResponse.data.results || tagsResponse.data;

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);

    } catch (error) {
      console.error('Failed to load initial data:', error);
      setCategories([]);
      setTags([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagSelect = (tagId) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag && !selectedTags.find(t => t.id === tagId)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !selectedTags.find(t => t.name === newTag.trim())) {
      const tempTag = { id: `temp_${Date.now()}`, name: newTag.trim() };
      setSelectedTags(prev => [...prev, tempTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag.id !== tagToRemove.id));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.details.trim()) {
      newErrors.details = 'Project description is required';
    } else if (formData.details.length < 100) {
      newErrors.details = 'Description must be at least 100 characters';
    }

    if (!formData.total_target) {
      newErrors.total_target = 'Funding goal is required';
    } else if (parseFloat(formData.total_target) < 100) {
      newErrors.total_target = 'Minimum goal is 100 EGP';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Campaign start date is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Campaign end date is required';
    } else if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      const minDuration = 7 * 24 * 60 * 60 * 1000;

      if (endDate <= startDate) {
        newErrors.end_time = 'End date must be after start date';
      } else if (endDate - startDate < minDuration) {
        newErrors.end_time = 'Campaign must run for at least 7 days';
      }
    }

    // Enhanced image validation per PDF requirements
    if (images.length === 0) {
      newErrors.images = 'Please upload at least one image';
    } else if (images.length < 3) {
      newErrors.images = 'Please upload at least 3 images (1 main + 2 additional) as per PDF requirements';
    }

    if (selectedTags.length === 0) {
      newErrors.tags = 'Please select or add at least one tag';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const projectFormData = new FormData();

      // Add basic form fields
      Object.keys(formData).forEach(key => {
        if (key === 'category') {
          projectFormData.append(key, parseInt(formData[key]));
        } else {
          projectFormData.append(key, formData[key]);
        }
      });

      // Add tags in the format Django expects
      selectedTags.forEach((tag, index) => {
        projectFormData.append(`tags[${index}]`, tag.name);
      });

      // Add images with proper naming for Django backend
      images.forEach((image, index) => {
        projectFormData.append(`image_${index}`, image);
      });

      console.log('Submitting project data...');
      // Debug: Log what we're sending
      for (let pair of projectFormData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await projectsAPI.create(projectFormData);
      navigate(`/projects/${response.data.id}`);

    } catch (error) {
      console.error('Failed to create project:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to create project. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinStartDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    if (formData.start_time) {
      const startDate = new Date(formData.start_time);
      startDate.setDate(startDate.getDate() + 7);
      return startDate.toISOString().split('T')[0];
    }
    return getMinStartDate();
  };

  if (dataLoading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Loading campaign creation form...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          border: '1px solid #E5E7EB',
          borderRadius: 2
        }}
      >
        <Typography
          variant={isMobile ? "h4" : "h3"}
          fontWeight="bold"
          gutterBottom
        >
          Start a FundEgypt campaign
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Tell your story and inspire people to support your cause
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Project Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title || "Create a compelling title that captures attention"}
                placeholder="Help rebuild the community center"
                required
              />
            </Grid>

            {/* Project Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Campaign Story"
                name="details"
                value={formData.details}
                onChange={handleChange}
                error={!!errors.details}
                helperText={errors.details || `Tell your story in detail (${formData.details.length}/500+ characters recommended)`}
                placeholder="Share your story, explain why this campaign matters, and how the funds will be used..."
                required
              />
            </Grid>

            {/* Funding Goal and Category */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Funding Goal"
                name="total_target"
                type="number"
                value={formData.total_target}
                onChange={handleChange}
                error={!!errors.total_target}
                helperText={errors.total_target || "Minimum 100 EGP"}
                InputProps={{
                  startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                  inputProps: { min: 100, step: 50 }
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category} required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories && categories.length > 0 ? (
                    categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No categories available</MenuItem>
                  )}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Campaign Start and End Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Campaign Start Date"
                name="start_time"
                type="date"
                value={formData.start_time}
                onChange={handleChange}
                error={!!errors.start_time}
                helperText={errors.start_time || "When should your campaign begin?"}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getMinStartDate() }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Campaign End Date"
                name="end_time"
                type="date"
                value={formData.end_time}
                onChange={handleChange}
                error={!!errors.end_time}
                helperText={errors.end_time || "Minimum 7 days from start date"}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getMinEndDate() }}
                required
              />
            </Grid>

            {/* Enhanced Tags Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Tags
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add relevant tags to help people discover your project
              </Typography>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {selectedTags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      onDelete={() => removeTag(tag)}
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}

              {/* Add existing tags */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select from existing tags</InputLabel>
                <Select
                  value=""
                  label="Select from existing tags"
                  onChange={(e) => handleTagSelect(e.target.value)}
                >
                  {tags && tags.length > 0 ? (
                    tags.filter(tag => !selectedTags.find(st => st.id === tag.id)).map(tag => (
                      <MenuItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No tags available</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Add new tag */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Add new tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g., education, health, community"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddNewTag}
                  startIcon={<Add />}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>

              {errors.tags && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.tags}
                </Typography>
              )}
            </Grid>

            {/* Enhanced Image Upload */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Campaign Images
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload at least 3 images: 1 main image + 2 additional images (max 5 total)
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2 }}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>

                {errors.images && (
                  <Typography variant="caption" color="error" display="block" sx={{ mb: 2 }}>
                    {errors.images}
                  </Typography>
                )}

                {/* Enhanced Image Preview */}
                {images.length > 0 && (
                  <Grid container spacing={2}>
                    {images.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: index === 0 ? '3px solid #00B964' : '1px solid #E5E7EB'
                            }}
                          />

                          {/* Image Label */}
                          <Chip
                            label={index === 0 ? 'Main Image' : `Additional ${index}`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              bgcolor: index === 0 ? '#00B964' : '#6B7280',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />

                          <Button
                            size="small"
                            onClick={() => removeImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              minWidth: 'auto',
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                            }}
                          >
                            <Close fontSize="small" />
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>

            {/* Featured Project Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_featured}
                    onChange={handleChange}
                    name="is_featured"
                  />
                }
                label="Request featured status (subject to admin approval)"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#00B964',
                    '&:hover': { bgcolor: '#00A855' },
                    px: 4
                  }}
                >
                  {loading ? 'Creating Campaign...' : 'Launch Campaign'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProject;
