import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  IconButton,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { projectsAPI, commentsAPI } from '../services/api';

const ReportModal = ({ open, onClose, projectId, commentId, type = 'project', onSuccess }) => {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam' },
    { value: 'fraud', label: 'Fraud/Scam' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) {
      setError('Please select a report type and provide a description.');
      return;
    }

    // Validate minimum description length
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reportData = {
        report_type: reportType,
        description: description.trim()
      };

      console.log('Submitting report:', { type, reportData });

      if (type === 'project' && projectId) {
        await projectsAPI.reportProject(projectId, reportData);
      } else if (type === 'comment' && commentId) {
        await commentsAPI.reportComment(commentId, reportData);
      }

      setSuccess(true);

      // Call success callback to refresh comments
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
        setReportType('');
        setDescription('');
        setError('');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit report:', error);

      // Handle specific error messages from backend
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.description) {
        setError(error.response.data.description[0]);
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setReportType('');
    setDescription('');
    setError('');
    setSuccess(false);
  };

  if (success) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            ✅ Report Submitted Successfully
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your report. We'll review it within 24 hours and take appropriate action.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* FIXED: Use Box instead of DialogTitle to avoid h2>h6 nesting */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        pb: 1,
        borderBottom: '1px solid #E5E7EB'
      }}>
        <Typography variant="h6" component="h2" fontWeight="bold">
          Report {type === 'project' ? 'Project' : 'Comment'}
        </Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Help us maintain a safe community by reporting inappropriate content.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
            What's wrong with this {type}?
          </FormLabel>
          <RadioGroup
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            {reportTypes.map(option => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please provide more details about the issue... (minimum 10 characters)"
          required
          helperText={`${description.length}/500 characters (minimum 10 required)`}
          inputProps={{ maxLength: 500 }}
          error={description.length > 0 && description.trim().length < 10}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !reportType || description.trim().length < 10}
          sx={{
            bgcolor: '#00A86B',
            '&:hover': { bgcolor: '#00695C' }
          }}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportModal;
