import React, { useState } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const mockAddresses = [
  { id: 1, type: 'Home', address: '123 Main St, Anytown, USA' },
  { id: 2, type: 'Work', address: '456 Business Ave, Corp City, USA' },
];

const validationSchema = Yup.object({
  type: Yup.string().required('Type is required (e.g., Home, Work)'),
  address: Yup.string().required('Address is required'),
});

const AddressManager = () => {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const formik = useFormik({
    initialValues: {
      type: '',
      address: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (editingId) {
        setAddresses(addresses.map(addr => addr.id === editingId ? { ...addr, ...values } : addr));
        setEditingId(null);
      } else {
        setAddresses([...addresses, { id: Date.now(), ...values }]);
      }
      resetForm();
      setIsAdding(false);
    },
  });

  const handleEdit = (address) => {
    setEditingId(address.id);
    setIsAdding(false);
    formik.setValues({ type: address.type, address: address.address });
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleAddNew = () => {
    setEditingId(null);
    setIsAdding(true);
    formik.resetForm();
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    formik.resetForm();
  };

  const renderForm = () => (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>{editingId ? 'Edit Address' : 'Add New Address'}</Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="type"
          name="type"
          label="Type (e.g., Home, Work)"
          variant="outlined"
          margin="normal"
          value={formik.values.type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.type && Boolean(formik.errors.type)}
          helperText={formik.touched.type && formik.errors.type}
        />
        <TextField
          fullWidth
          id="address"
          name="address"
          label="Full Address"
          variant="outlined"
          margin="normal"
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.address && Boolean(formik.errors.address)}
          helperText={formik.touched.address && formik.errors.address}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button color="primary" variant="contained" type="submit">
            {editingId ? 'Save Changes' : 'Add Address'}
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Addresses</Typography>
      <List>
        {addresses.map(address => (
          <ListItem
            key={address.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(address)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(address.id)} sx={{ ml: 1 }}>
                  <Delete />
                </IconButton>
              </>
            }
            sx={{ borderBottom: '1px solid #eee' }}
          >
            <ListItemText primary={address.type} secondary={address.address} />
          </ListItem>
        ))}
      </List>
      {!isAdding && !editingId && (
        <Button startIcon={<Add />} onClick={handleAddNew} variant="contained" sx={{ mt: 2 }}>
          Add New Address
        </Button>
      )}
      {(isAdding || editingId) && renderForm()}
    </Box>
  );
};

export default AddressManager;