import React, { useState } from 'react';
import { Box, IconButton, Paper } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { getImageUrl } from '../services/api';

const ImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ height: 400, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>No images available</Typography>
      </Box>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Box sx={{ position: 'relative', height: 400, borderRadius: 2, overflow: 'hidden' }}>
      {/* Main Image */}
      <img
        src={getImageUrl(images[currentIndex]?.image)}
        alt={`Project image ${currentIndex + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
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
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
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
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1
        }}>
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
