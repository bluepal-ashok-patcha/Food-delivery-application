import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Slide
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme, maxWidth }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '3px',
    maxHeight: '90vh',
    maxWidth: maxWidth === 'lg' ? '900px' : maxWidth === 'md' ? '600px' : maxWidth === 'sm' ? '420px' : '420px',
    width: '100%',
    margin: '16px',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px 12px',
  borderBottom: '1px solid #f0f0f0',
  position: 'sticky',
  top: 0,
  backgroundColor: '#fff',
  zIndex: 1,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '20px',
  overflowY: 'auto',
  flex: 1,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 24px 20px',
  borderTop: '1px solid #f0f0f0',
  position: 'sticky',
  bottom: 0,
  backgroundColor: '#fff',
  zIndex: 1,
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  disableBackdropClick = false,
  ...props
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      disableEscapeKeyDown={disableBackdropClick}
      {...props}
    >
      {title && (
        <StyledDialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
      )}
      
      <StyledDialogContent dividers={!title}>
        {children}
      </StyledDialogContent>
      
      {actions && (
        <StyledDialogActions>
          {actions}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal;
