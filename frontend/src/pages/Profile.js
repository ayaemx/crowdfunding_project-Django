import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Avatar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile_phone: '',
    birthdate: '',
    facebook_profile: '',
    country: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        mobile_phone: user.mobile_phone || '',
        birthdate: user.birthdate || '',
        facebook_profile: user.facebook_profile || '',
        country: user.country || ''
      });
    }
  }, [user]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  try {
    // Validate phone number format before sending
    if (formData.mobile_phone && !/^01[0125][0-9]{8}$/.test(formData.mobile_phone)) {
      setErrors({ mobile_phone: 'Invalid Egyptian phone number format (01xxxxxxxxx)' });
      setLoading(false);
      return;
    }

    const updateData = new FormData();

    // Only append non-empty values
    Object.keys(formData).forEach(key => {
      if (formData[key] && formData[key].trim() !== '') {
        updateData.append(key, formData[key].trim());
      }
    });

    if (profilePicture) {
      updateData.append('profile_picture', profilePicture);
    }

    console.log('Sending update data:', Object.fromEntries(updateData));

    const response = await authAPI.updateProfile(updateData);
    updateUser(response.data);
    setSuccess(true);

    setTimeout(() => setSuccess(false), 3000);

  } catch (error) {
    console.error('Profile update failed:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);

    if (error.response?.data) {
      // Handle Django validation errors
      const serverErrors = {};
      Object.keys(error.response.data).forEach(field => {
        if (Array.isArray(error.response.data[field])) {
          serverErrors[field] = error.response.data[field][0];
        } else {
          serverErrors[field] = error.response.data[field];
        }
      });
      setErrors(serverErrors);
    } else {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    }
  } finally {
    setLoading(false);
  }
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
          Profile Settings
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Update your personal information and preferences
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              src={profilePicture ? URL.createObjectURL(profilePicture) : user?.profile_picture}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Change Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                JPG, PNG or GIF. Max size 5MB.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="mobile_phone"
                value={formData.mobile_phone}
                onChange={handleChange}
                error={!!errors.mobile_phone}
                helperText={errors.mobile_phone || "Format: 01xxxxxxxxx"}
                placeholder="01xxxxxxxxx"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birth Date"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                error={!!errors.birthdate}
                helperText={errors.birthdate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  name="country"
                  value={formData.country}
                  label="Country"
                  onChange={handleChange}
                >
                  <MenuItem value="Egypt">Egypt</MenuItem>
                  <MenuItem value="Saudi Arabia">Saudi Arabia</MenuItem>
                  <MenuItem value="UAE">UAE</MenuItem>
                  <MenuItem value="Jordan">Jordan</MenuItem>
                  <MenuItem value="Lebanon">Lebanon</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Facebook Profile"
                name="facebook_profile"
                value={formData.facebook_profile}
                onChange={handleChange}
                error={!!errors.facebook_profile}
                helperText={errors.facebook_profile}
                placeholder="https://facebook.com/yourprofile"
              />
            </Grid>

            {/* Email (Read-only) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed. Contact support if needed."
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{
                    bgcolor: '#00B964',
                    '&:hover': { bgcolor: '#00A855' },
                    px: 4
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
