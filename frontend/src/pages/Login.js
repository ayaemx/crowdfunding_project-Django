import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // Local error state

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('Login: Starting login process...');
    const response = await login(formData);
    console.log('Login: Login successful, response:', response);

    // Check if user is set in context
    setTimeout(() => {
      console.log('Login: Checking auth state after login...');
      console.log('User in localStorage:', localStorage.getItem('token'));
      navigate(from, { replace: true });
    }, 200); // Increased delay

  } catch (error) {
    console.error('Login failed:', error);
    setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: { xs: 4, md: 8 },
        mb: { xs: 4, md: 8 },
        px: { xs: 2, sm: 3 }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          position: 'relative',
          border: '1px solid #E5E7EB',
          borderRadius: 2
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleCancel}
          sx={{
            position: 'absolute',
            right: { xs: 8, md: 16 },
            top: { xs: 8, md: 16 },
            color: '#6B7280'
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ mt: { xs: 2, md: 0 } }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            align="center"
            gutterBottom
            fontWeight="bold"
          >
            Welcome back
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4, px: { xs: 0, md: 2 } }}
          >
            Sign in to your FundEgypt account to continue supporting amazing projects
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              placeholder="Enter your email"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="Enter your password"
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mb: 3,
                bgcolor: '#00B964',
                '&:hover': { bgcolor: '#00A855' },
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{
                  color: '#00B964',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Create your FundEgypt account
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
