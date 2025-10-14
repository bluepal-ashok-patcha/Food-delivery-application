import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const PieChart = ({ 
  title, 
  data, 
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showLegend = true,
  formatTooltip = (value, name, props) => [`${value}`, name],
  colors = COLORS
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
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            {showLegend && <Legend wrapperStyle={{ paddingTop: '10px', paddingBottom: '20px' }} />}
          </RechartsPieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PieChart;
