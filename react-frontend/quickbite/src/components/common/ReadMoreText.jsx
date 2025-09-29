import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Button from './Button';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const ReadMoreText = ({ text, maxLength = 100, sx = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? text : text.substring(0, maxLength) + '...';

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box
        sx={{
          maxHeight: isExpanded ? '60px' : '32px',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '2px' },
          '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '2px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#a8a8a8' },
          ...sx,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '12px', lineHeight: 1.4, color: '#888', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}
        >
          {displayText}
        </Typography>
      </Box>
      {shouldTruncate && (
        <Button
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ minWidth: 'auto', p: 0, fontSize: '11px', color: '#fc8019', textTransform: 'none', fontWeight: 600, mt: 0.5, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
          endIcon={isExpanded ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
    </Box>
  );
};

export default ReadMoreText;


