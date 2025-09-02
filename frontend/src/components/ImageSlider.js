import React, { useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { getImageUrl } from '../services/api';

const ImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No images available
        </Typography>
      </Box>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];
  const imageUrl = getImageUrl(currentImage?.image_url || currentImage?.image || currentImage);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
      {/* Main Image */}
      <Paper
        component="img"
        src={imageUrl}
        alt={`Project image ${currentIndex + 1}`}
        onError={(e) => {
          e.target.src = '/placeholder-project.jpg';
        }}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 2
        }}
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={prevImage}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton
            onClick={nextImage}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ImageSlider;
