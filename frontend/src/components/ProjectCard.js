import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  LinearProgress,
  Avatar,
  Chip
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, showAuthor = true }) => {
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          '& .card-media': {
            transform: 'scale(1.02)',
          }
        }
      }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          className="card-media"
          component="img"
          height="200"
          image={project.pictures?.[0]?.image || '/placeholder-project.jpg'}
          alt={project.title}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />

        {/* Category Badge */}
        {project.category && (
          <Chip
            label={project.category.name}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'white',
              color: '#6B7280',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: '#2C2C2C'
          }}
        >
          {project.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 3,
            lineHeight: 1.5
          }}
        >
          {project.details}
        </Typography>

        {/* Author info */}
        {showAuthor && project.user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ width: 24, height: 24, mr: 1 }}
              src={project.user.profile_picture}
            >
              <Person fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              {project.user.first_name} {project.user.last_name}
            </Typography>
          </Box>
        )}

        {/* Progress */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" fontWeight="bold" color="#2C2C2C">
              {formatCurrency(project.total_donations)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progressPercentage.toFixed(0)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              mb: 2,
              height: 4,
              borderRadius: 2,
              bgcolor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#00B964',
                borderRadius: 2
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              raised of {formatCurrency(project.total_target)}
            </Typography>
            {daysRemaining !== null && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Campaign ended'}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
