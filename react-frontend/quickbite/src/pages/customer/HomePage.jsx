import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Paper, Typography, Button, Chip, LinearProgress } from '@mui/material';
import { deliveryAPI, orderAPI } from '../../services/api';
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
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurants(filters));
  }, [dispatch, filters]);
  // Fetch latest active order and assignment for banner
  useEffect(() => {
    let cancelled = false;
    async function loadActive() {
      try {
        setActiveLoading(true);
        const activeRes = await orderAPI.getActiveOrder();
        const active = activeRes?.data || null;
        if (!cancelled && active) {
          setActiveOrder(active);
          try {
            const assignRes = await deliveryAPI.getAssignmentByOrder(active.id);
            const a = assignRes?.data;
            if (!cancelled) setActiveAssignment(a);
          } catch (_) {
            if (!cancelled) setActiveAssignment(null);
          }
        } else if (!cancelled) {
          setActiveOrder(null);
          setActiveAssignment(null);
        }
      } catch (_) {
        if (!cancelled) {
          setActiveOrder(null);
          setActiveAssignment(null);
        }
      } finally {
        if (!cancelled) setActiveLoading(false);
      }
    }
    if (isAuthenticated) loadActive();
    const id = setInterval(() => { if (isAuthenticated) loadActive(); }, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [isAuthenticated]);

  const goToTrack = () => {
    if (activeOrder) {
      window.location.href = `/orders/${activeOrder.id}`;
    }
  };

  const computeProgress = () => {
    const o = (activeOrder?.orderStatus || activeOrder?.status || '').toUpperCase();
    const d = (activeAssignment?.status || '').toUpperCase();
    if (o === 'DELIVERED' || d === 'DELIVERED') return 100;
    if (o === 'OUT_FOR_DELIVERY' || ['PICKED_UP','HEADING_TO_DELIVERY','ARRIVED_AT_DELIVERY'].includes(d)) return 75;
    if (['PREPARING','ACCEPTED','READY_FOR_PICKUP'].includes(o) || ['ACCEPTED','HEADING_TO_PICKUP','ARRIVED_AT_PICKUP'].includes(d)) return 45;
    return 20;
  };

  const statusText = () => {
    const o = (activeOrder?.orderStatus || activeOrder?.status || '').toUpperCase();
    const d = (activeAssignment?.status || '').toUpperCase();
    if (o === 'DELIVERED' || d === 'DELIVERED') return 'Delivered';
    if (o === 'OUT_FOR_DELIVERY' || ['PICKED_UP','HEADING_TO_DELIVERY','ARRIVED_AT_DELIVERY'].includes(d)) return 'Out for delivery';
    if (['PREPARING','ACCEPTED','READY_FOR_PICKUP'].includes(o) || ['ACCEPTED','HEADING_TO_PICKUP','ARRIVED_AT_PICKUP'].includes(d)) return 'Preparing your order';
    return 'Order placed';
  };


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
        {isAuthenticated && (activeLoading || activeOrder) && (
          <Paper sx={{ p: 2, borderRadius: '3px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #fff6ed 0%, #ffffff 60%, #fdf1e6 100%)', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#fc8019', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 26, boxShadow: '0 6px 14px rgba(252,128,25,0.35)' }}>🛵</Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>{statusText()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeAssignment?.status ? `Status: ${activeAssignment.status}` : (activeLoading ? 'Checking your active orders…' : 'Preparing your order…')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {activeAssignment?.estimatedDuration && (
                  <Chip size="small" color="primary" label={`~ ${activeAssignment.estimatedDuration} mins`} />
                )}
                <Button variant="contained" onClick={goToTrack} sx={{ textTransform: 'none', backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' }, borderRadius: '3px', px: 2.2 }}>Track</Button>
              </Box>
            </Box>
            <Box sx={{ mt: 1.5 }}>
              <LinearProgress variant="determinate" value={computeProgress()} sx={{ height: 6, borderRadius: 3, backgroundColor: '#ffe8d6', '& .MuiLinearProgress-bar': { backgroundColor: '#fc8019' } }} />
            </Box>
          </Paper>
        )}
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

        {loading.restaurants ? (
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
