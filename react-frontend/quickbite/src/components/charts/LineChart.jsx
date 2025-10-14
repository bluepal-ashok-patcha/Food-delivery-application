import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography, Box, useMediaQuery, useTheme } from '@mui/material';

const LineChart = ({ 
  title, 
  data, 
  dataKey, 
  xAxisKey, 
  color = '#8884d8',
  height = 300,
  showLegend = true,
  showGrid = true,
  formatXAxis = (value) => value,
  formatYAxis = (value) => value,
  formatTooltip = (value, name) => [value, name]
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const chartHeight = isSmallMobile ? 200 : isMobile ? 250 : height;
  const fontSize = isSmallMobile ? 10 : 12;

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ 
        p: isMobile ? 2 : 3, 
        height: chartHeight + (isMobile ? 40 : 60), 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: '#fff'
      }}>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: isMobile ? 2 : 3, 
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      background: '#fff',
      height: chartHeight + (isMobile ? 40 : 60),
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        outline: 'none',
        border: 'none'
      },
      '&:focus': {
        outline: 'none',
        border: 'none'
      }
    }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ 
        fontWeight: 700, 
        color: '#333', 
        mb: 2,
        fontSize: isMobile ? '14px' : '16px'
      }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
           <RechartsLineChart data={data} margin={{ 
             top: 5, 
             right: isMobile ? 10 : 30, 
             left: isMobile ? 10 : 20, 
             bottom: 40 
           }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
             <XAxis 
               dataKey={xAxisKey} 
               tick={{ fontSize, dy: 10 }}
               tickFormatter={formatXAxis}
             />
            <YAxis 
              tick={{ fontSize }}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: isMobile ? '12px' : '14px'
              }}
            />
            {showLegend && !isSmallMobile && <Legend wrapperStyle={{ paddingTop: '10px' }} />}
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={isMobile ? 1.5 : 2}
              dot={{ fill: color, strokeWidth: 2, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 4 : 6, stroke: color, strokeWidth: 2 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default LineChart;
