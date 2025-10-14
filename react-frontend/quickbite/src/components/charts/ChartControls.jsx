import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Stack, Chip } from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';

const ChartControls = ({ 
  period, 
  onPeriodChange, 
  chartType, 
  onChartTypeChange, 
  onRefresh, 
  onExport,
  showChartTypeSelector = false,
  chartTypes = ['line', 'bar', 'area'],
  periods = ['today', 'week', 'month', 'year']
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 2, 
      alignItems: 'center', 
      justifyContent: 'space-between',
      mb: 3,
      p: 2,
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={period}
            label="Time Period"
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            {periods.map(p => (
              <MenuItem key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {showChartTypeSelector && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              label="Chart Type"
              onChange={(e) => onChartTypeChange(e.target.value)}
            >
              {chartTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={onRefresh}
          sx={{
            borderColor: '#6c757d',
            color: '#6c757d',
            '&:hover': {
              borderColor: '#495057',
              backgroundColor: '#f8f9fa'
            }
          }}
        >
          Refresh
        </Button>
        
        {onExport && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            onClick={onExport}
            sx={{
              borderColor: '#28a745',
              color: '#28a745',
              '&:hover': {
                borderColor: '#218838',
                backgroundColor: '#f8fff9'
              }
            }}
          >
            Export
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default ChartControls;
