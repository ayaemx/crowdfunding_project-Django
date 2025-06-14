import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  TextField
} from '@mui/material';
import { projectsAPI } from '../services/api';

const ProjectCancellationModal = ({ open, onClose, project, onCancel }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const progressPercentage = (project.total_donations / project.total_target) * 100;
  const canCancel = progressPercentage < 25;

  const handleCancel = async () => {
    if (!canCancel) return;

    setLoading(true);
    try {
      await projectsAPI.cancelProject(project.id, reason);
      onCancel();
      onClose();
    } catch (error) {
      console.error('Failed to cancel project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancel Project</DialogTitle>
      <DialogContent>
        {canCancel ? (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. Your project will be permanently cancelled.
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Current funding: {progressPercentage.toFixed(1)}% (Less than 25% threshold)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're cancelling this project..."
              required
            />
          </>
        ) : (
          <Alert severity="error">
            Cannot cancel project. Current funding is {progressPercentage.toFixed(1)}%, which exceeds the 25% threshold.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {canCancel && (
          <Button
            onClick={handleCancel}
            color="error"
            disabled={!reason.trim() || loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Project'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectCancellationModal;
