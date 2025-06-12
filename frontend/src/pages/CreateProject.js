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
  useMediaQuery,
  useTheme
} from '@mui/material';
import { CloudUpload, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, categoriesAPI } from '../services/api';

const CreateProject = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    details: '',
    total_target: '',
    category: '',
    end_time: '',
    tags: ''
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.end_time) {
      newErrors.end_time = 'Campaign end date is required';
    } else {
      const endDate = new Date(formData.end_time);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7); // Minimum 7 days

      if (endDate < minDate) {
        newErrors.end_time = 'Campaign must run for at least 7 days';
      }
    }

    if (images.length === 0) {
      newErrors.images = 'Please upload at least one image';
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

      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          // Convert comma-separated tags to array
          const tagsArray = formData[key].split(',').map(tag => tag.trim()).filter(tag => tag);
          projectFormData.append(key, JSON.stringify(tagsArray));
        } else {
          projectFormData.append(key, formData[key]);
        }
      });

      // Add images
      images.forEach((image, index) => {
        projectFormData.append(`image_${index}`, image);
      });

      const response = await projectsAPI.create(projectFormData);

      // Redirect to the created project
      navigate(`/projects/${response.data.id}`);

    } catch (error) {
      console.error('Failed to create project:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to create project. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (7 days from now)
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

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
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Campaign Duration */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Campaign End Date"
                name="end_time"
                type="date"
                value={formData.end_time}
                onChange={handleChange}
                error={!!errors.end_time}
                helperText={errors.end_time || "Minimum 7 days from today"}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getMinDate() }}
                required
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                helperText="Separate tags with commas (e.g., education, community, health)"
                placeholder="education, community, health"
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Campaign Images
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload up to 5 images that tell your story
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

                {/* Image Preview */}
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
                              borderRadius: '8px'
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
                            ×
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
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
