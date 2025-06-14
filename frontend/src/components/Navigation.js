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
  Divider
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
  Favorite
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E8F5E8',
          py: 1
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, sm: 2 }, minHeight: '72px !important' }}>
            {/* Logo Section - GoFundMe Style */}
            <Box
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                flexGrow: isMobile ? 1 : 0,
                mr: { xs: 0, md: 6 }
              }}
            >
              {/* Logo Icon */}
              <Box sx={{
                background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
                borderRadius: 4,
                p: 1.5,
                mr: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 52,
                height: 52,
                boxShadow: '0 4px 16px rgba(0, 168, 107, 0.25)'
              }}>
                <Favorite sx={{ color: 'white', fontSize: '1.6rem' }} />
              </Box>

              {/* Arabic and English Names */}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#2E3B2E',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontFamily: '"Cairo", "Inter", sans-serif',
                    lineHeight: 1.2
                  }}
                >
                  الخير فينا
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#00A86B',
                    display: 'block',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    fontWeight: 600,
                    letterSpacing: '1px',
                    lineHeight: 1,
                    textTransform: 'uppercase'
                  }}
                >
                  GOODNESS
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation - More Spaced */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', gap: 3, mr: 'auto' }}>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      startIcon={item.icon}
                      sx={{
                        color: '#4A5D4A',
                        fontWeight: 500,
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        '&:hover': {
                          bgcolor: '#E8F5E8',
                          color: '#2E3B2E'
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>

                {isAuthenticated ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/projects/create')}
                      sx={{
                        background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
                        borderRadius: 4,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00695C 0%, #00A86B 100%)',
                        }
                      }}
                    >
                      Start Campaign
                    </Button>

                    <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                      {user?.profile_picture ? (
                        <Avatar src={user.profile_picture} sx={{ width: 40, height: 40 }} />
                      ) : (
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#00A86B' }}>
                          {user?.first_name?.[0] || <AccountCircle />}
                        </Avatar>
                      )}
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        elevation: 16,
                        sx: {
                          mt: 2,
                          borderRadius: 3,
                          minWidth: 220,
                          border: '1px solid #E8F5E8',
                          boxShadow: '0 8px 32px rgba(0, 168, 107, 0.15)'
                        }
                      }}
                    >
                      <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }} sx={{ py: 2 }}>
                        <Dashboard sx={{ mr: 2, color: '#00A86B' }} />
                        Dashboard
                      </MenuItem>
                      <MenuItem onClick={() => { handleClose(); navigate('/profile'); }} sx={{ py: 2 }}>
                        <Person sx={{ mr: 2, color: '#00A86B' }} />
                        Profile
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ py: 2 }}>
                        <ExitToApp sx={{ mr: 2, color: '#EF5350' }} />
                        Sign Out
                      </MenuItem>
                    </Menu>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Button
                      onClick={() => navigate('/login')}
                      sx={{
                        color: '#4A5D4A',
                        fontWeight: 500,
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        '&:hover': {
                          bgcolor: '#E8F5E8',
                          color: '#2E3B2E'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register')}
                      sx={{
                        background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
                        borderRadius: 4,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00695C 0%, #00A86B 100%)',
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
                edge="end"
                onClick={handleMobileMenuToggle}
                sx={{ color: '#2E3B2E' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: '#F8FDF8'
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold" color="#2E3B2E">
            Menu
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <Close sx={{ color: '#2E3B2E' }} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#E8F5E8' }} />

        <List sx={{ px: 2 }}>
          {navigationItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 3,
                mb: 1,
                '&:hover': {
                  bgcolor: '#E8F5E8'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#00A86B' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} sx={{ color: '#2E3B2E' }} />
            </ListItem>
          ))}

          {isAuthenticated && (
            <>
              <Divider sx={{ my: 2, borderColor: '#E8F5E8' }} />
              <ListItem
                button
                onClick={() => {
                  navigate('/projects/create');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  mb: 1,
                  '&:hover': {
                    bgcolor: '#E8F5E8'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#00A86B' }}><Add /></ListItemIcon>
                <ListItemText primary="Start Campaign" sx={{ color: '#2E3B2E' }} />
              </ListItem>

              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#E8F5E8'
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#EF5350' }}><ExitToApp /></ListItemIcon>
                <ListItemText primary="Sign Out" sx={{ color: '#2E3B2E' }} />
              </ListItem>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Divider sx={{ my: 2, borderColor: '#E8F5E8' }} />
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
                    bgcolor: '#E8F5E8'
                  }
                }}
              >
                <ListItemText primary="Sign In" sx={{ color: '#2E3B2E' }} />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#E8F5E8'
                  }
                }}
              >
                <ListItemText primary="Join Us" sx={{ color: '#2E3B2E' }} />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navigation;
