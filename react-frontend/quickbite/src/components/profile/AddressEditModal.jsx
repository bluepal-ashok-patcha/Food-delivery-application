import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid } from '@mui/material';

const AddressEditModal = ({ open, onClose, address, onSave }) => {
  const [form, setForm] = React.useState({ street: '', city: '', state: '', zipCode: '', type: 'Home' });
  useEffect(() => {
    if (address) setForm({ street: address.street || '', city: address.city || '', state: address.state || '', zipCode: address.zipCode || '', type: address.type || 'Home' });
  }, [address]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Address</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}><TextField label="Street" name="street" value={form.street} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={6}><TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={3}><TextField label="State" name="state" value={form.state} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={3}><TextField label="Zip Code" name="zipCode" value={form.zipCode} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12}><TextField label="Type" name="type" value={form.type} onChange={handleChange} fullWidth size="small" /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(form)} sx={{ textTransform: 'none', backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' } }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressEditModal;


