import React from 'react';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DeclineButton = ({ onClick }) => {
  return (
    <Button
      variant="contained"
      color="error"
      size="small"
      startIcon={<CloseIcon />}
      onClick={onClick}
    >
      Decline
    </Button>
  );
};

export default DeclineButton; 