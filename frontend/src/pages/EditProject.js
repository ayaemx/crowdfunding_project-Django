import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Delete, PhotoCamera } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, authAPI } from '../services/api';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [categories, setCategories] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    category: '',
    total_target: '',
    tags: [],
    pictures: []
  });
  const [newTag, setNewTag] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    loadProjectAndCategories();
  }, [id]);

  const loadProjectAndCategories = async () => {
    try {
      setLoading(true);
      setError('');

      // Load project details and categories in parallel
      const [projectResponse, categoriesResponse] = await Promise.all([
        authAPI.getMyProjects(), // Get all user projects first
        projectsAPI.getCategories()
      ]);

      // Find the specific project
      const projectsData = projectResponse.data?.results || projectResponse.data || [];
      const currentProject = Array.isArray(projectsData)
        ? projectsData.find(p => p.id === parseInt(id))
        : null;

      if (!currentProject) {
        setError('Project not found or you do not have permission to edit it.');
        return;
      }

      // Set categories - handle different response formats
      const categoriesData = categoriesResponse.data?.results || categoriesResponse.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Set project data
      setProject(currentProject);
      setFormData({
        title: currentProject.title || '',
        details: currentProject.details || '',
        category: currentProject.category?.id || currentProject.category || '',
        total_target: currentProject.total_target || '',
        tags: currentProject.tags || [],
        pictures: currentProject.pictures || []
      });

    } catch (error) {
      console.error('Failed to load project data:', error);
      setError('Failed to load project data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPicture = (pictureId) => {
    setFormData(prev => ({
      ...prev,
      pictures: prev.pictures.filter(pic => pic.id !== pictureId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = new FormData();
      updateData.append('title', formData.title);
      updateData.append('details', formData.details);
      updateData.append('category', formData.category);
      updateData.append('total_target', formData.total_target);

      // Add tags
      formData.tags.forEach(tag => {
        updateData.append('tags', tag);
      });

      // Add new files
      selectedFiles.forEach(file => {
        updateData.append('pictures', file);
      });

      // Add existing picture IDs to keep
      formData.pictures.forEach(pic => {
        updateData.append('existing_pictures', pic.id);
      });

      await projectsAPI.updateProject(id, updateData);
      setSuccess('Project updated successfully!');

      // Redirect back to dashboard after successful update
      setTimeout(() => {
        navigate('/dashboard');
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
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading project...
        </Typography>
      </Container>
    );
  }

  if (error && !project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Project
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Details */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Project Details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Total Target */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Target Amount (EGP)"
                  name="total_target"
                  value={formData.total_target}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
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
                    label="Add Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>

              {/* Existing Pictures */}
              {formData.pictures.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Current Pictures
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.pictures.map((picture) => (
                      <Grid item xs={6} sm={4} md={3} key={picture.id}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="120"
                            image={picture.image_url || picture.image}
                            alt="Project"
                          />
                          <Box sx={{ p: 1, textAlign: 'center' }}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveExistingPicture(picture.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {/* New Pictures */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Add New Pictures
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{ mb: 2 }}
                >
                  Select Pictures
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>

                {selectedFiles.length > 0 && (
                  <Grid container spacing={2}>
                    {selectedFiles.map((file, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="120"
                            image={URL.createObjectURL(file)}
                            alt="New"
                          />
                          <Box sx={{ p: 1, textAlign: 'center' }}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{
                      background: 'linear-gradient(135deg, #00B964 0%, #00A855 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #00A855 0%, #009648 100%)' }
                    }}
                  >
                    {saving ? 'Updating...' : 'Update Project'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditProject;
