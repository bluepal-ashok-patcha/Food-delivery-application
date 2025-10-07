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
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurants(filters));
  }, [dispatch, filters]);

  // Debounce live search to avoid rapid re-fetches and focus loss
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== filters.search) {
        dispatch(setFilters({ search: searchQuery }));
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, filters.search, dispatch]);

  // Initialize default sort only once
  useEffect(() => {
    if (!filters.sortBy || !filters.sortDir) {
      dispatch(setFilters({ sortBy: 'name', sortDir: 'asc' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryFilter = (category) => {
    if (category === 'All') {
      // Clear both cuisine and search when selecting All
      dispatch(setFilters({ cuisine: '', search: '' }));
      setSearchQuery('');
    } else {
      dispatch(setFilters({ cuisine: category }));
    }
  };

  const handleSearch = (value) => {
    const v = value !== undefined ? value : searchQuery;
    dispatch(setFilters({ search: v }));
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

  // Keep header mounted; show loading state inline below

  // Build cuisine categories from CURRENT results (respecting active search)
  const cuisineCategories = (() => {
    const names = Array.from(new Set(restaurants.map(r => r.cuisine).filter(Boolean)));
    const source = names.length ? names : (mockCategories.map(c => c.name));
    const items = source.map((name, idx) => ({ id: idx + 1, name }));
    return [{ id: 0, name: 'All' }, ...items];
  })();

  const activeCuisineName = filters.cuisine || 'All';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />

      <Container maxWidth="lg">
        <CategoriesBar categories={cuisineCategories} activeCuisine={activeCuisineName} onSelect={handleCategoryFilter} />

        <SortFilterBar
          count={restaurants.length}
          onSelectSort={({ sortBy: sb, sortDir: sd }) => {
            if (!sb || !sd) {
              // Clear sorting to default
              dispatch(setFilters({ sortBy: 'name', sortDir: 'asc', page: 0 }));
            } else {
              dispatch(setFilters({ sortBy: sb, sortDir: sd, page: 0 }));
            }
          }}
        />

        {loading ? (
          <LoadingSpinner fullScreen={false} message="Loading restaurants..." />
        ) : restaurants.length === 0 ? (
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
