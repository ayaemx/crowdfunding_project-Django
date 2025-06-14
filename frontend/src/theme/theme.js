import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#00A86B', // Calm jade green
      light: '#4CAF50', // Soft green
      dark: '#00695C', // Deep teal
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#26A69A', // Teal
      light: '#80CBC4', // Light teal
      dark: '#00695C', // Dark teal
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FDF8', // Very light green tint
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E3B2E', // Dark green-gray
      secondary: '#4A5D4A', // Medium green-gray
    },
    success: {
      main: '#66BB6A', // Soft success green
      light: '#C8E6C9',
      dark: '#388E3C',
    },
    warning: {
      main: '#FFA726', // Warm orange
      light: '#FFE0B2',
      dark: '#F57C00',
    },
    error: {
      main: '#EF5350', // Soft red
      light: '#FFCDD2',
      dark: '#C62828',
    },
    info: {
      main: '#26A69A', // Teal
      light: '#B2DFDB',
      dark: '#00695C',
    }
  },
  typography: {
    fontFamily: '"Inter", "Cairo", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#2E3B2E',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#2E3B2E',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#2E3B2E',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
      color: '#2E3B2E',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#4A5D4A',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#4A5D4A',
    }
  },
  shape: {
    borderRadius: 16, // More rounded like GoFundMe
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 32px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 168, 107, 0.25)',
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #00A86B 0%, #26A69A 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00695C 0%, #00A86B 100%)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 20px rgba(0, 168, 107, 0.08)',
          border: '1px solid #E8F5E8',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 168, 107, 0.15)',
            transform: 'translateY(-2px)',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    }
  }
});
