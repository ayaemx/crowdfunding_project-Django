import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Select,
  FormControl
} from '@mui/material';
import { AccountCircle, Add, Language } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [language, setLanguage] = useState('en');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #E5E7EB',
        color: '#2C2C2C'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Enhanced Logo Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.02)',
                '& .arabic-logo': {
                  color: '#00A855'
                }
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/')}
          >
            {/* Arabic Calligraphy Logo */}
            <Box sx={{ mr: 3 }}>
              <Typography
                className="arabic-logo"
                sx={{
                  fontFamily: 'Scheherazade New, Amiri, serif',
                  fontWeight: 700,
                  fontSize: '2.2rem',
                  color: '#00B964',
                  direction: 'rtl',
                  lineHeight: 1,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(45deg, #00B964 30%, #4CAF50 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transition: 'all 0.3s ease',
                  letterSpacing: '2px',
                  // Add calligraphy-style decorative elements
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    right: '0',
                    left: '0',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, #00B964 50%, transparent 100%)',
                    borderRadius: '1px'
                  }
                }}
              >
                فينا الخير
              </Typography>
              {/* Decorative Arabic ornament */}
              <Box sx={{
                textAlign: 'center',
                mt: -0.5,
                direction: 'rtl'
              }}>
                <Typography sx={{
                  fontSize: '0.8rem',
                  color: '#00B964',
                  fontFamily: 'Scheherazade New, serif',
                  opacity: 0.7
                }}>
                  ❋ ❋ ❋
                </Typography>
              </Box>
            </Box>

            {/* English Brand Name */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#2C2C2C',
                  fontSize: '1.5rem',
                  letterSpacing: '-0.5px'
                }}
              >
                FundEgypt
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#6B7280',
                  fontSize: '0.75rem',
                  display: 'block',
                  lineHeight: 1,
                  fontWeight: 500
                }}
              >
                Crowdfunding Platform
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Language Selector */}
            <FormControl size="small" sx={{ minWidth: 80, mr: 2 }}>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    py: 0.5,
                    fontSize: '0.875rem'
                  }
                }}
              >
                <MenuItem value="en">🇺🇸 EN</MenuItem>
                <MenuItem value="ar">🇪🇬 AR</MenuItem>
              </Select>
            </FormControl>

            {isAuthenticated ? (
              <>
                <Button
                  startIcon={<Add />}
                  onClick={() => navigate('/projects/create')}
                  sx={{
                    color: '#6B7280',
                    '&:hover': {
                      bgcolor: '#F3F4F6',
                      color: '#00B964'
                    }
                  }}
                >
                  Start a project
                </Button>

                <IconButton
                  size="large"
                  onClick={handleMenu}
                  sx={{
                    '&:hover': { bgcolor: '#F3F4F6' }
                  }}
                >
                  {user?.profile_picture ? (
                    <Avatar
                      src={user.profile_picture}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle sx={{ fontSize: 32, color: '#6B7280' }} />
                  )}
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '1px solid #E5E7EB'
                    }
                  }}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
                    My Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                    Profile Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#6B7280',
                    '&:hover': {
                      bgcolor: '#F3F4F6',
                      color: '#2C2C2C'
                    }
                  }}
                >
                  Sign in
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: '#00B964',
                    '&:hover': {
                      bgcolor: '#00A855'
                    }
                  }}
                >
                  Start a FundEgypt
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
