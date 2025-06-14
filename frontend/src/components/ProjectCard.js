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
  CardActions
} from '@mui/material';
import { Star, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Helper function to handle Django media URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-project.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://127.0.0.1:8000${imagePath}`;
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
  const cardHeight = variant === "compact" ? 420 : 480;
  const imageHeight = variant === "compact" ? 180 : 220;

  return (
    <Card
      sx={{
        height: cardHeight,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        border: '1px solid #E8F5E8',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 48px rgba(0, 168, 107, 0.2)',
          border: '1px solid #00A86B',
          '& .card-media': {
            transform: 'scale(1.05)',
          },
          '& .card-overlay': {
            opacity: 1,
          }
        }
      }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* FIXED: Better image handling with proper sizing */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: imageHeight }}>
        <Box
          className="card-media"
          sx={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${getImageUrl(project.pictures?.[0]?.image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'transform 0.4s ease',
            // FIXED: Ensure image covers the entire area
            minHeight: imageHeight,
          }}
        />

        {/* Hover Overlay */}
        <Box
          className="card-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0, 168, 107, 0.85) 0%, rgba(38, 166, 154, 0.85) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#00A86B',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              '&:hover': { bgcolor: '#F8FDF8' }
            }}
          >
            View Details
          </Button>
        </Box>

        {/* Progress Badge */}
        <Chip
          label={`${progressPercentage.toFixed(0)}%`}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: progressPercentage >= 100 ? '#4CAF50' : '#00A86B',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: variant === "compact" ? 2.5 : 3 }}>
        <Typography
          gutterBottom
          variant={variant === "compact" ? "h6" : "h5"}
          component="h3"
          sx={{
            fontWeight: 'bold',
            lineHeight: 1.3,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: '#2E3B2E'
          }}
        >
          {project.title}
        </Typography>

        <Typography
          variant="body2"
          color="#4A5D4A"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: variant === "compact" ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            lineHeight: 1.5
          }}
        >
          {project.details}
        </Typography>

        {/* Author info */}
        {showAuthor && project.user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{ width: 28, height: 28, mr: 1 }}
              src={project.user.profile_picture}
            >
              <Person fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="#4A5D4A">
              by {project.user.first_name} {project.user.last_name}
            </Typography>
          </Box>
        )}

        {/* Category and Rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          {project.category && (
            <Chip
              label={project.category.name}
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#00A86B',
                color: '#00A86B',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
          )}
          {project.average_rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star sx={{ color: '#FFB300', fontSize: 18, mr: 0.5 }} />
              <Typography variant="body2" fontWeight="bold" color="#4A5D4A">
                {project.average_rating.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Progress and amounts */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight="bold" color="#00A86B">
              Raised: {formatCurrency(project.total_donations)}
            </Typography>
            <Typography variant="body2" color="#4A5D4A" fontWeight="bold">
              {progressPercentage.toFixed(1)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              mb: 2,
              height: 8,
              borderRadius: 4,
              bgcolor: '#E8F5E8',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
                borderRadius: 4
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="#4A5D4A">
              Goal: {formatCurrency(project.total_target)}
            </Typography>
            {daysRemaining !== null && (
              <Typography
                variant="body2"
                color={daysRemaining > 7 ? "#4A5D4A" : "#EF5350"}
                fontWeight={daysRemaining <= 7 ? "bold" : "normal"}
              >
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Campaign ended'}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: variant === "compact" ? 2 : 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={daysRemaining === 0}
          sx={{
            background: daysRemaining === 0
              ? 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)'
              : 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
            fontWeight: 'bold',
            py: 1.5,
            borderRadius: 3,
            '&:hover': {
              background: daysRemaining === 0
                ? 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)'
                : 'linear-gradient(135deg, #00695C 0%, #00A86B 100%)',
            }
          }}
        >
          {daysRemaining === 0 ? 'Campaign Ended' : 'Support Project'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
