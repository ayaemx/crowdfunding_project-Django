import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  CardActions,
  CardMedia,
  Stack
} from '@mui/material';
import {
  Star,
  Person,
  AccessTime,
  TrendingUp,
  Verified,
  LocalOffer,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-project.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://127.0.0.1:8000${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

const ProjectCard = ({ project, showAuthor = true, variant = "standard" }) => {
  const navigate = useNavigate();

  const progressPercentage = project.total_target > 0
    ? Math.min((project.total_donations / project.total_target) * 100, 100)
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount).replace('EGP', 'EGP');
  };

  const getDaysRemaining = () => {
    if (!project.end_time) return null;
    const endDate = new Date(project.end_time);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  const getMainImage = () => {
    if (project.pictures && project.pictures.length > 0) {
      const mainPic = project.pictures.find(pic => pic.is_main) || project.pictures[0];
      return getImageUrl(mainPic.image);
    }
    return '/placeholder-project.jpg';
  };

  const getUrgencyColor = () => {
    if (daysRemaining <= 3) return '#F44336';
    if (daysRemaining <= 7) return '#FF9800';
    return '#4CAF50';
  };

  const getProgressColor = () => {
    if (progressPercentage >= 100) return '#4CAF50';
    if (progressPercentage >= 75) return '#8BC34A';
    if (progressPercentage >= 50) return '#FFC107';
    return '#2C3E2D';
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card
        sx={{
          height: 520,
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(44, 62, 45, 0.08)',
          boxShadow: '0 4px 20px rgba(44, 62, 45, 0.08)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(44, 62, 45, 0.15)',
            '& .card-image': {
              transform: 'scale(1.05)',
            },
            '& .support-button': {
              background: 'linear-gradient(135deg, #2C3E2D 0%, #1F2B20 100%)',
              transform: 'translateY(-2px)',
            }
          }
        }}
        onClick={() => navigate(`/projects/${project.id}`)}
      >
        {/* Enhanced Image Section */}
        <Box sx={{ position: 'relative', height: 220, overflow: 'hidden' }}>
          <CardMedia
            className="card-image"
            component="img"
            height="220"
            image={getMainImage()}
            alt={project.title}
            sx={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              transition: 'transform 0.4s ease',
              backgroundColor: '#F8F6F3',
            }}
            onError={(e) => {
              e.target.src = '/placeholder-project.jpg';
            }}
          />

          {/* Elegant Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(44,62,45,0.1) 0%, rgba(44,62,45,0.3) 100%)',
              zIndex: 1
            }}
          />

          {/* Progress Badge */}
          <Chip
            icon={<TrendingUp sx={{ fontSize: '14px !important' }} />}
            label={`${progressPercentage.toFixed(0)}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'linear-gradient(135deg, #2C3E2D 0%, #3D5A3F 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              zIndex: 2,
              boxShadow: '0 4px 12px rgba(44, 62, 45, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          />

          {/* Featured Badge */}
          {project.is_featured && (
            <Chip
              icon={<Verified sx={{ fontSize: '14px !important' }} />}
              label="Featured"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'linear-gradient(135deg, #D4A574 0%, #C19660 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
              }}
            />
          )}

          {/* Enhanced Tags Display */}
          {project.tags && project.tags.length > 0 && (
            <Box sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              zIndex: 2
            }}>
              {project.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={tag.id || index}
                  icon={<LocalOffer sx={{ fontSize: '12px !important' }} />}
                  label={tag.name}
                  size="small"
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    color: '#2C3E2D',
                    fontSize: '0.7rem',
                    height: 24,
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 2px 8px rgba(44, 62, 45, 0.1)'
                  }}
                />
              ))}
              {project.tags.length > 2 && (
                <Chip
                  label={`+${project.tags.length - 2}`}
                  size="small"
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    color: '#2C3E2D',
                    fontSize: '0.7rem',
                    height: 24,
                    fontWeight: 500,
                    boxShadow: '0 2px 8px rgba(44, 62, 45, 0.1)'
                  }}
                />
              )}
            </Box>
          )}

          {/* Urgency Indicator */}
          {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 12,
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.7rem',
                fontWeight: 600,
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <AccessTime sx={{ fontSize: '12px' }} />
              {daysRemaining}d left
            </Box>
          )}

          {/* Favorite Button */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 60,
              zIndex: 2
            }}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Add favorite functionality
                }}
              >
                <FavoriteBorder sx={{ fontSize: '16px', color: '#2C3E2D' }} />
              </Box>
            </motion.div>
          </Box>
        </Box>

        {/* Enhanced Content Section */}
        <CardContent sx={{
          flexGrow: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              lineHeight: 1.3,
              color: '#2C3E2D',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6rem',
              mb: 1,
              fontFamily: '"Inter", sans-serif'
            }}
          >
            {project.title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.9rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7rem',
              color: '#5A6B5D'
            }}
          >
            {project.details}
          </Typography>

          {/* Author Info */}
          {showAuthor && (project.owner || project.user) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#D4A574',
                  border: '2px solid #F8F6F3'
                }}
                src={(project.owner?.profile_picture || project.user?.profile_picture) ?
                  getImageUrl(project.owner?.profile_picture || project.user?.profile_picture) : undefined}
              >
                {!(project.owner?.profile_picture || project.user?.profile_picture) &&
                  <Person fontSize="small" />}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{
                  fontWeight: 600,
                  color: '#2C3E2D',
                  fontSize: '0.8rem',
                  fontFamily: '"Inter", sans-serif'
                }}>
                  {(project.owner?.first_name || project.user?.first_name)} {(project.owner?.last_name || project.user?.last_name)}
                </Typography>
                <Typography variant="caption" sx={{
                  display: 'block',
                  color: '#8B9A8E',
                  fontSize: '0.7rem'
                }}>
                  Project Creator
                </Typography>
              </Box>
            </Box>
          )}

          {/* Category and Rating Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {project.category && (
              <Chip
                label={project.category.name}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  borderColor: '#2C3E2D',
                  color: '#2C3E2D',
                  backgroundColor: 'rgba(44, 62, 45, 0.05)'
                }}
              />
            )}

            {project.average_rating > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ fontSize: '16px', color: '#D4A574' }} />
                <Typography variant="caption" sx={{
                  fontWeight: 600,
                  color: '#2C3E2D',
                  fontSize: '0.8rem'
                }}>
                  {project.average_rating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Enhanced Progress Section */}
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                color: '#2C3E2D',
                fontSize: '1rem',
                fontFamily: '"Inter", sans-serif'
              }}>
                {formatCurrency(project.total_donations || 0)}
              </Typography>
              <Typography variant="body2" sx={{
                fontWeight: 600,
                color: getProgressColor(),
                fontSize: '0.9rem'
              }}>
                {progressPercentage.toFixed(1)}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#F5F2EE',
                mb: 1.5,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #2C3E2D 0%, #3D5A3F 100%)',
                  borderRadius: 4,
                  transition: 'all 0.3s ease'
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{
                color: '#8B9A8E',
                fontSize: '0.8rem'
              }}>
                Goal: {formatCurrency(project.total_target)}
              </Typography>

              {daysRemaining !== null && (
                <Typography
                  variant="caption"
                  sx={{
                    color: getUrgencyColor(),
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>

        {/* Enhanced Button Section */}
        <CardActions sx={{ p: 3, pt: 0 }}>
          <motion.div
            style={{ width: '100%' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="support-button"
              variant="contained"
              fullWidth
              disabled={daysRemaining === 0}
              sx={{
                background: daysRemaining === 0
                  ? '#9E9E9E'
                  : 'linear-gradient(135deg, #2C3E2D 0%, #3D5A3F 100%)',
                color: 'white',
                fontWeight: 700,
                fontFamily: '"Inter", sans-serif',
                py: 1.5,
                borderRadius: 3,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: daysRemaining === 0
                  ? 'none'
                  : '0 4px 16px rgba(44, 62, 45, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: daysRemaining === 0
                    ? '#9E9E9E'
                    : 'linear-gradient(135deg, #1F2B20 0%, #2C3E2D 100%)',
                  boxShadow: daysRemaining === 0
                    ? 'none'
                    : '0 6px 20px rgba(44, 62, 45, 0.4)',
                },
                '&:disabled': {
                  backgroundColor: '#9E9E9E',
                  color: 'white',
                  boxShadow: 'none'
                }
              }}
            >
              {daysRemaining === 0 ? 'Campaign Ended' : 'Support This Project'}
            </Button>
          </motion.div>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
