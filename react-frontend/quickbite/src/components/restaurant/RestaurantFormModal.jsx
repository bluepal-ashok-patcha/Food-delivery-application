import React, { useMemo } from 'react';
import { Box, Stack, Grid, Typography, Button, Chip, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../components/common/Modal';
import TextField from '../../components/common/TextField';
import { openMapModal } from '../../store/slices/locationSlice';

const RestaurantFormModal = ({
  open,
  onClose,
  title,
  values,
  onChange,
  onSubmit,
  submitLabel = 'Save',
  isSaving = false,
}) => {
  const dispatch = useDispatch();
  const { currentLocation, isGeocoding, selectedCoordinates } = useSelector((s) => s.location);

  const actions = useMemo(() => (
    <Stack direction="row" spacing={1}>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={() => onSubmit(values)} disabled={isSaving} sx={{ background: '#fc8019' }}>
        {submitLabel}
      </Button>
    </Stack>
  ), [onClose, onSubmit, values, isSaving, submitLabel]);

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="md" fullWidth actions={actions}>
      <Box sx={{ maxHeight: '80vh', overflowY: 'auto', p: 1 }}>
        <Stack spacing={2}>
          <TextField label="Restaurant Name" fullWidth value={values.name || ''} onChange={(e) => onChange({ name: e.target.value })} />
          <TextField label="Cuisine Type" fullWidth value={values.cuisineType || ''} onChange={(e) => onChange({ cuisineType: e.target.value })} />
          <TextField label="Address" fullWidth multiline rows={2} value={values.address || ''} onChange={(e) => onChange({ address: e.target.value })} />
          <TextField label="Contact Number" fullWidth value={values.contactNumber || ''} onChange={(e) => onChange({ contactNumber: e.target.value })} />
          <TextField label="Description" fullWidth multiline rows={3} value={values.description || ''} onChange={(e) => onChange({ description: e.target.value })} />
          <TextField label="Tags (comma-separated)" fullWidth placeholder="Popular, Fast Delivery, Best Seller" value={values.tags || ''} onChange={(e) => onChange({ tags: e.target.value })} />
          <TextField label="Logo Image URL" fullWidth value={values.image || ''} onChange={(e) => onChange({ image: e.target.value })} />
          <TextField label="Cover Image URL" fullWidth value={values.coverImage || ''} onChange={(e) => onChange({ coverImage: e.target.value })} />
          <TextField label="Delivery Time (e.g., 25-30 mins)" fullWidth value={values.deliveryTime || ''} onChange={(e) => onChange({ deliveryTime: e.target.value })} />
          <TextField label="Opening Time" type="time" fullWidth value={values.openingTime || ''} onChange={(e) => onChange({ openingTime: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField label="Closing Time" type="time" fullWidth value={values.closingTime || ''} onChange={(e) => onChange({ closingTime: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField label="Delivery Radius (km)" type="number" fullWidth value={values.deliveryRadiusKm ?? ''} onChange={(e) => onChange({ deliveryRadiusKm: Number(e.target.value) })} />
          <TextField label="Opening Hours (Text)" fullWidth placeholder="10:00 AM - 11:00 PM" value={values.openingHours || ''} onChange={(e) => onChange({ openingHours: e.target.value })} />
          <Stack spacing={2}>
            <TextField label="Latitude" type="number" value={values.latitude ?? ''} onChange={(e) => onChange({ latitude: e.target.value })} fullWidth />
            <TextField label="Longitude" type="number" value={values.longitude ?? ''} onChange={(e) => onChange({ longitude: e.target.value })} fullWidth />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Button fullWidth variant="outlined" size="medium" onClick={() => dispatch(openMapModal())}>Select on Map</Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button fullWidth variant="contained" size="medium" disabled={isGeocoding} onClick={() => {
                  if (isGeocoding) { return; }
                  const lat = selectedCoordinates?.lat ?? currentLocation.lat;
                  const lng = selectedCoordinates?.lng ?? currentLocation.lng;
                  onChange({ latitude: lat, longitude: lng, address: values.address || currentLocation.address });
                }} sx={{ background: '#fc8019' }}>{isGeocoding ? 'Loading…' : 'Use Selected'}</Button>
              </Grid>
            </Grid>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl>
                <FormLabel>Menu Type</FormLabel>
                <RadioGroup
                  row
                  value={values.isVeg ? 'VEG' : 'NON_VEG'}
                  onChange={(e) => onChange({ isVeg: e.target.value === 'VEG' })}
                >
                  <FormControlLabel value="VEG" control={<Radio />} label="Veg" />
                  <FormControlLabel value="NON_VEG" control={<Radio />} label="Non-Veg" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl>
                <FormLabel>Composition</FormLabel>
                <RadioGroup
                  row
                  value={values.isPureVeg ? 'PURE' : 'MIXED'}
                  onChange={(e) => onChange({ isPureVeg: e.target.value === 'PURE' })}
                >
                  <FormControlLabel value="PURE" control={<Radio />} label="Pure Veg" />
                  <FormControlLabel value="MIXED" control={<Radio />} label="Mixed" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Modal>
  );
};

export default RestaurantFormModal;


