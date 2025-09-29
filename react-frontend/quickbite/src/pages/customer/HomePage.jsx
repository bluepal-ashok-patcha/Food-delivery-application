import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Paper, Typography } from '@mui/material';
import { fetchRestaurants, setFilters } from '../../store/slices/restaurantSlice';
import { openLoginModal } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockCategories } from '../../constants/mockData';
import HomeHeader from '../../components/home/HomeHeader';
import CategoriesBar from '../../components/home/CategoriesBar';
import SortFilterBar from '../../components/home/SortFilterBar';
import RestaurantCard from '../../components/home/RestaurantCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { restaurants, loading, filters } = useSelector((state) => state.restaurants);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const handleCategoryFilter = (category) => {
    dispatch(setFilters({ cuisine: category }));
  };

  const handleSearch = () => {
    dispatch(setFilters({ search: searchQuery }));
  };

  const handleRestaurantClick = (restaurantId) => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    window.location.href = `/restaurant/${restaurantId}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading restaurants..." />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />

      <Container maxWidth="lg">
        <CategoriesBar categories={mockCategories} activeCuisine={filters.cuisine} onSelect={handleCategoryFilter} />

        <SortFilterBar count={restaurants.length} onToggleFilters={() => setShowFilters(!showFilters)} />

        {restaurants.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '16px', fontWeight: 600 }}>
              No restaurants found
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            width: '100%',
            justifyContent: { xs: 'center', sm: 'flex-start', md: 'flex-start' }
          }}>
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={handleRestaurantClick} formatPrice={formatPrice} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
