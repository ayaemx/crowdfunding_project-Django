import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Delete,
  Add,
  Save,
  ArrowBack,
  PhotoCamera,
  Schedule,
  AttachMoney
} from '@mui/icons-material';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { projectsAPI, categoriesAPI, tagsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    category: '',
    total_target: '',
    currency: 'EGP',
    start_time: new Date(),
    end_time: new Date(),
    tags: [],
    is_featured: false
  });

  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    loadProjectData();
    loadCategories();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const response = await projectsAPI.getDetail(id);
      const projectData = response.data;

      // Check if user is the owner
      if (projectData.user?.id !== user?.id) {
        navigate('/dashboard');
        return;
      }

      setProject(projectData);
      setFormData({
        title: projectData.title,
        details: projectData.details,
        category: projectData.category?.id || '',
        total_target: projectData.total_target,
        currency: projectData.currency,
        start_time: new Date(projectData.start_time),
        end_time: new Date(projectData.end_time),
        tags: projectData.tags?.map(tag => tag.name) || [],
        is_featured: projectData.is_featured
      });
      setExistingImages(projectData.pictures || []);
    } catch (error) {
      console.error('Failed to load project:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      // Add basic project data
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formData.tags.forEach((tag, index) => {
            formDataToSend.append(`tags[${index}]`, tag);
          });
        } else if (key === 'start_time' || key === 'end_time') {
          formDataToSend.append(key, formData[key].toISOString());
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add new images
      images.forEach((image, index) => {
        formDataToSend.append(`image_${index}`, image);
      });

      // Add images to delete
      imagesToDelete.forEach((imageId, index) => {
        formDataToSend.append(`delete_image_${index}`, imageId);
      });

      await projectsAPI.update(id, formDataToSend);
      setSuccess('Project updated successfully!');

      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 2000);

    } catch (error) {
      console.error('Failed to update project:', error);
      setError('Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading project...</Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2, color: '#6B7280' }}
          >
            Back
          </Button>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight="bold"
            gutterBottom
          >
            Edit Your Campaign
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update your project details and keep your supporters informed
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid xs={12} md={8}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Project Details
                  </Typography>

                  {/* Title */}
                  <TextField
                    fullWidth
                    label="Campaign Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    sx={{ mb: 3 }}
                    helperText="Choose a clear, compelling title for your campaign"
                  />

                  {/* Description */}
                  <TextField
                    fullWidth
                    label="Campaign Description"
                    multiline
                    rows={6}
                    value={formData.details}
                    onChange={(e) => handleInputChange('details', e.target.value)}
                    required
                    sx={{ mb: 3 }}
                    helperText="Tell your story and explain why people should support your campaign"
                  />

                  {/* Category */}
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                    >
                      {categories.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Tags */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Images Section */}
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mt: 3 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Campaign Images
                  </Typography>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Current Images
                      </Typography>
                      <ImageList cols={isMobile ? 2 : 3} gap={8}>
                        {existingImages.map((image) => (
                          <ImageListItem key={image.id} sx={{ position: 'relative' }}>
                            <img
                              src={image.image}
                              alt="Project"
                              style={{ borderRadius: 8, height: 150, objectFit: 'cover' }}
                            />
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                              }}
                              size="small"
                              onClick={() => handleRemoveExistingImage(image.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}

                  {/* New Images */}
                  {images.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        New Images to Add
                      </Typography>
                      <ImageList cols={isMobile ? 2 : 3} gap={8}>
                        {images.map((image, index) => (
                          <ImageListItem key={index} sx={{ position: 'relative' }}>
                            <img
                              src={URL.createObjectURL(image)}
                              alt="New"
                              style={{ borderRadius: 8, height: 150, objectFit: 'cover' }}
                            />
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                              }}
                              size="small"
                              onClick={() => handleRemoveNewImage(index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}

                  {/* Upload Button */}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{ borderStyle: 'dashed', py: 2 }}
                    fullWidth
                  >
                    Add More Images
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid xs={12} md={4}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, position: 'sticky', top: 20 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Campaign Settings
                  </Typography>

                  {/* Funding Goal */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Funding Goal
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Target Amount"
                      value={formData.total_target}
                      onChange={(e) => handleInputChange('total_target', e.target.value)}
                      required
                      InputProps={{
                        endAdornment: <Typography color="text.secondary">EGP</Typography>
                      }}
                    />
                  </Box>

                  {/* Timeline */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Campaign Timeline
                    </Typography>

                    <DateTimePicker
                      label="Start Date"
                      value={formData.start_time}
                      onChange={(newValue) => handleInputChange('start_time', newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth sx={{ mb: 2 }} />
                      )}
                    />

                    <DateTimePicker
                      label="End Date"
                      value={formData.end_time}
                      onChange={(newValue) => handleInputChange('end_time', newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(-1)}
                      fullWidth={isMobile}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                      sx={{
                        bgcolor: '#00B964',
                        '&:hover': { bgcolor: '#00A855' }
                      }}
                      fullWidth={isMobile}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default EditProject;
