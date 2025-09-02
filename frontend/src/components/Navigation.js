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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Chip
} from '@mui/material';
import {
  AccountCircle,
  Add,
  Menu as MenuIcon,
  Home,
  Search,
  Dashboard,
  Person,
  ExitToApp,
  Close,
  Favorite,
  TrendingUp,
  AutoAwesome,
  Campaign,
  ManageAccounts
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Discover', icon: <Search />, path: '/projects' },
    ...(isAuthenticated ? [
      { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { label: 'Profile', icon: <Person />, path: '/profile' }
    ] : [])
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2C3E2D 0%, #1B2A1C 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: { xs: 0.5, md: 1 }, minHeight: { xs: 56, md: 64 } }}>
            {/* Logo Section - Enhanced Responsive */}
            <Box
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                flexGrow: { xs: 1, lg: 0 },
                mr: { xs: 0, lg: 4 }
              }}
            >
              {/* Logo Icon */}
              <Box
                sx={{
                  width: { xs: 35, md: 45 },
                  height: { xs: 35, md: 45 },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4A574 0%, #C19660 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: { xs: 1, md: 2 },
                  boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)'
                }}
              >
                <TrendingUp sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
              </Box>

              {/* Brand Names */}
              <Box sx={{ display: { xs: 'block', sm: 'block' } }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontFamily: '"Inter", sans-serif',
                    lineHeight: 1,
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                  }}
                >
                  FundEgypt
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#D4A574',
                    fontWeight: 600,
                    fontSize: { xs: '0.6rem', md: '0.7rem' },
                    letterSpacing: '0.5px',
                    fontFamily: '"Inter", sans-serif',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  CROWDFUNDING PLATFORM
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation - Enhanced Responsive */}
            {!isMobile && (
              <Box sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                gap: { md: 0.5, lg: 1 },
                justifyContent: 'center'
              }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      fontFamily: '"Inter", sans-serif',
                      px: { md: 1.5, lg: 2.5 },
                      py: 1,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontSize: { md: '0.85rem', lg: '0.95rem' },
                      minWidth: 'auto',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <Box component="span" sx={{ display: { md: 'none', lg: 'inline' } }}>
                      {item.label}
                    </Box>
                  </Button>
                ))}

                {isAuthenticated ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                    {/* Create Campaign Button */}
                    <Button
                      startIcon={<Add />}
                      onClick={() => navigate('/projects/create')}
                      sx={{
                        background: 'linear-gradient(135deg, #D4A574 0%, #C19660 100%)',
                        borderRadius: 3,
                        px: { md: 2, lg: 3 },
                        py: 1.2,
                        fontWeight: 600,
                        fontFamily: '"Inter", sans-serif',
                        textTransform: 'none',
                        fontSize: { md: '0.85rem', lg: '0.95rem' },
                        boxShadow: '0 4px 16px rgba(212, 165, 116, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #C19660 0%, #B8956A 100%)',
                          boxShadow: '0 6px 20px rgba(212, 165, 116, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Box component="span" sx={{ display: { md: 'none', lg: 'inline' } }}>
                        Start Campaign
                      </Box>
                      <Box component="span" sx={{ display: { md: 'inline', lg: 'none' } }}>
                        Start
                      </Box>
                    </Button>

                    {/* User Menu */}
                    <IconButton
                      size="large"
                      onClick={handleMenu}
                      color="inherit"
                      sx={{ ml: 1 }}
                    >
                      {user?.profile_picture ? (
                        <Avatar src={user.profile_picture} sx={{ width: 35, height: 35 }} />
                      ) : (
                        <Avatar sx={{ width: 35, height: 35, bgcolor: '#D4A574' }}>
                          {user?.first_name?.[0] || <AccountCircle />}
                        </Avatar>
                      )}
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          mt: 1.5,
                          minWidth: 200,
                          borderRadius: 2,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                        }
                      }}
                    >
                      <MenuItem
                        onClick={() => { handleClose(); navigate('/dashboard'); }}
                        sx={{
                          py: 1.5,
                          fontFamily: '"Inter", sans-serif',
                          '&:hover': { bgcolor: 'rgba(44, 62, 45, 0.05)' }
                        }}
                      >
                        <Dashboard sx={{ mr: 2 }} />
                        Dashboard
                      </MenuItem>
                      <MenuItem
                        onClick={() => { handleClose(); navigate('/profile'); }}
                        sx={{
                          py: 1.5,
                          fontFamily: '"Inter", sans-serif',
                          '&:hover': { bgcolor: 'rgba(44, 62, 45, 0.05)' }
                        }}
                      >
                        <ManageAccounts sx={{ mr: 2 }} />
                        Profile
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          py: 1.5,
                          fontFamily: '"Inter", sans-serif',
                          color: 'error.main',
                          '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.05)' }
                        }}
                      >
                        <ExitToApp sx={{ mr: 2 }} />
                        Sign Out
                      </MenuItem>
                    </Menu>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                    <Button
                      onClick={() => navigate('/login')}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500,
                        fontFamily: '"Inter", sans-serif',
                        px: { md: 1.5, lg: 2.5 },
                        py: 1,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => navigate('/register')}
                      sx={{
                        background: 'linear-gradient(135deg, #D4A574 0%, #C19660 100%)',
                        borderRadius: 3,
                        px: { md: 2, lg: 3 },
                        py: 1.2,
                        fontWeight: 600,
                        fontFamily: '"Inter", sans-serif',
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(212, 165, 116, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #C19660 0%, #B8956A 100%)',
                          boxShadow: '0 6px 20px rgba(212, 165, 116, 0.4)'
                        }
                      }}
                    >
                      Join Us
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Enhanced Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 320 },
            background: 'linear-gradient(135deg, #F8F6F3 0%, #FEFEFE 100%)',
            borderTopLeftRadius: { xs: 0, sm: 20 },
            borderBottomLeftRadius: { xs: 0, sm: 20 }
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2C3E2D' }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <List sx={{ p: 0 }}>
            {navigationItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(44, 62, 45, 0.05)'
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            {isAuthenticated && (
              <>
                <Divider sx={{ my: 2 }} />
                <ListItem
                  button
                  onClick={() => {
                    navigate('/projects/create');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    borderRadius: 3,
                    mb: 1,
                    bgcolor: 'rgba(212, 165, 116, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(212, 165, 116, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon><Add /></ListItemIcon>
                  <ListItemText primary="Start Campaign" />
                </ListItem>
                <ListItem
                  button
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 3,
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.05)'
                    }
                  }}
                >
                  <ListItemIcon><ExitToApp color="error" /></ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </ListItem>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Divider sx={{ my: 2 }} />
                <ListItem
                  button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    borderRadius: 3,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'rgba(44, 62, 45, 0.05)'
                    }
                  }}
                >
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary="Sign In" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    borderRadius: 3,
                    bgcolor: 'rgba(212, 165, 116, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(212, 165, 116, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon><Add /></ListItemIcon>
                  <ListItemText primary="Join Us" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;
