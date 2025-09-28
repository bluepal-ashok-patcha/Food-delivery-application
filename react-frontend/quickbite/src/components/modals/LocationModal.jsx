import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Box } from '@mui/material';
import { closeLocationModal } from '../../store/slices/uiSlice';
import LocationFetcher from '../location/LocationFetcher';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const LocationModal = () => {
  const dispatch = useDispatch();
  const { locationModalOpen } = useSelector((state) => state.ui);

  const handleClose = () => {
    dispatch(closeLocationModal());
  };

  return (
    <Modal open={locationModalOpen} onClose={handleClose}>
      <Box sx={style}>
        <LocationFetcher />
      </Box>
    </Modal>
  );
};

export default LocationModal;