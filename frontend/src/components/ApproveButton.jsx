import React from 'react';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const ApproveButton = ({ onClick }) => {
  return (
    <Button
      variant="contained"
      color="success"
      size="small"
      startIcon={<CheckIcon />}
      onClick={onClick}
      sx={{ mr: 1 }}
    >
      Approve
    </Button>
  );
};

export default ApproveButton; 