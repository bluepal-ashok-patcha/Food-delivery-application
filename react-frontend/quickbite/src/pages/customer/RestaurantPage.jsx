import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Grid, Chip, Divider } from '@mui/material';
import { fetchRestaurantById } from '../../store/slices/restaurantSlice';
import { addToCart } from '../../store/slices/cartSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import MenuItemRow from '../../components/restaurant/MenuItemRow';
import FloatingCartButton from '../../components/common/FloatingCartButton';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRestaurant, loading } = useSelector((state) => state.restaurants);
  const { items, totalItems } = useSelector((state) => state.cart);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(fetchRestaurantById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        customization: {}
      },
      restaurantId: currentRestaurant.id,
      restaurantName: currentRestaurant.name
    }));
    
    setQuantities(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveFromCart = (item) => {
    setQuantities(prev => ({
      ...prev,
      [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
    }));
  };

  const getItemQuantity = (itemId) => {
    return quantities[itemId] || 0;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading restaurant..." />;
  }

  if (!currentRestaurant) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Restaurant not found
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <RestaurantHeader
        name={currentRestaurant.name}
        description={currentRestaurant.description}
        rating={currentRestaurant.rating}
        totalRatings={currentRestaurant.totalRatings || 0}
        deliveryTime={currentRestaurant.deliveryTime}
        deliveryFeeText={`${formatPrice(currentRestaurant.deliveryFee)} delivery`}
        isOpen={currentRestaurant.isOpen}
        onBack={() => navigate(-1)}
      />

      <Container maxWidth="md" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {/* Menu Categories */}
        {currentRestaurant.menu?.map((category) => (
          <Box key={category.id} sx={{ mb: 4, width: '100%' }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#333',
                fontSize: '18px',
                borderBottom: '1px solid #fc8019',
                pb: 0.5,
                display: 'inline-block'
              }}
            >
              {category.category}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2, 
              width: '100%',
              maxWidth: '100%'
            }}>
              {category.items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={() => handleAddToCart(item)}
                  onRemove={() => handleRemoveFromCart(item)}
                  formatPrice={formatPrice}
                />
                ))}
            </Box>
          </Box>
        ))}
      </Container>
      <FloatingCartButton totalItems={totalItems} onClick={() => navigate('/cart')} />
    </Box>
  );
};

export default RestaurantPage;
