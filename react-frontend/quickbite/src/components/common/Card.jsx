import React from 'react';
import { Card as MuiCard, CardContent, CardMedia, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme, variant }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
  ...(variant === 'elevated' && {
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  }),
  ...(variant === 'outlined' && {
    border: '1px solid #e0e0e0',
    boxShadow: 'none',
  }),
}));

const Card = ({
  children,
  image,
  imageHeight = 200,
  title,
  subtitle,
  actions,
  onClick,
  variant = 'elevated',
  ...props
}) => {
  return (
    <StyledCard variant={variant} onClick={onClick} {...props}>
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={title || 'Card image'}
          sx={{ objectFit: 'cover' }}
        />
      )}
      {(title || subtitle || children) && (
        <CardContent>
          {title && (
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '1.25rem', 
              fontWeight: 600,
              color: '#333'
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ 
              margin: '0 0 12px 0', 
              color: '#666', 
              fontSize: '0.875rem' 
            }}>
              {subtitle}
            </p>
          )}
          {children}
        </CardContent>
      )}
      {actions && <CardActions>{actions}</CardActions>}
    </StyledCard>
  );
};

export default Card;
