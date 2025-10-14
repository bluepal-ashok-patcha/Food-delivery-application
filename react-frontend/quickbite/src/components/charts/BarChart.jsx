import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const BarChart = ({ 
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
  formatTooltip = (value, name) => [value, name],
  barRadius = [4, 4, 0, 0]
}) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ 
        p: 3, 
        height: height + 60, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: '#fff',
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
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      background: '#fff',
      height: height + 60,
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
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
             <XAxis 
               dataKey={xAxisKey} 
               tick={{ fontSize: 12, dy: 10 }}
               tickFormatter={formatXAxis}
             />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            {showLegend && <Legend wrapperStyle={{ paddingTop: '10px' }} />}
            <Bar 
              dataKey={dataKey} 
              fill={color}
              radius={barRadius}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default BarChart;
