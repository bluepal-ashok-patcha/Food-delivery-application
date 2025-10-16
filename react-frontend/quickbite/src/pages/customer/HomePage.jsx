import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Paper, Typography, Button, Chip, LinearProgress, Alert, Snackbar } from '@mui/material';
import { deliveryAPI, orderAPI } from '../../services/api';
import { fetchRestaurants, setFilters } from '../../store/slices/restaurantSlice';
import { openLoginModal } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockCategories } from '../../constants/mockData';
import HomeHeader from '../../components/home/HomeHeader';
import CategoriesBar from '../../components/home/CategoriesBar';
import SortFilterBar from '../../components/home/SortFilterBar';
import RestaurantCard from '../../components/home/RestaurantCard';
import LocationService from '../../utils/locationService';

const HomePage = () => {
  const dispatch = useDispatch();
  const { restaurants, restaurantsPage, loading, filters } = useSelector((state) => state.restaurants);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentLocation } = useSelector((state) => state.location);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  
  // Location-related state
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [showLocationAlert, setShowLocationAlert] = useState(false);

  // Location detection effect - prioritize navbar location, fallback to browser geolocation
  useEffect(() => {
    const detectLocation = async () => {
      // First priority: Use location selected in navbar
      if (currentLocation && currentLocation.lat && currentLocation.lng) {
        console.log('Using navbar selected location:', currentLocation);
        setUserLocation({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          address: currentLocation.address
        });
        setLocationError(null);
        
        // Update filters with navbar location and default 20km radius
        dispatch(setFilters({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          radiusKm: LocationService.DEFAULT_RADIUS_KM
        }));
        return;
      }

      // Fallback: Use browser geolocation if no navbar location
      if (!LocationService.isGeolocationSupported()) {
        setLocationError('Geolocation is not supported by this browser');
        return;
      }

      try {
        const location = await LocationService.getCurrentLocation();
        setUserLocation(location);
        setLocationError(null);
        
        // Update filters with browser location and default 20km radius
        dispatch(setFilters({
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: LocationService.DEFAULT_RADIUS_KM
        }));
      } catch (error) {
        console.warn('Location detection failed:', error.message);
        setLocationError(error.message);
        setShowLocationAlert(true);
        
        // Clear location filters if location detection fails
        dispatch(setFilters({
          latitude: undefined,
          longitude: undefined,
          radiusKm: undefined
        }));
      }
    };

    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]); // Re-run when navbar location changes

  useEffect(() => {
    dispatch(fetchRestaurants(filters));
  }, [filters]); // Remove dispatch dependency
  // Fetch latest active order and assignment for banner
  useEffect(() => {
    if (!isAuthenticated) return;
    
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
    
    // Load immediately
    loadActive();
    
    // Poll every 30 seconds instead of 10 seconds to reduce flickering
    const id = setInterval(() => { 
      if (isAuthenticated && !cancelled) loadActive(); 
    }, 30000);
    
    return () => { 
      cancelled = true; 
      clearInterval(id); 
    };
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
  }, [searchQuery, filters.search]); // Remove dispatch dependency

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

  const handleRestaurantClick = useCallback((restaurantId) => {
    // Allow all users (logged-in and non-logged-in) to view restaurant pages
    window.location.href = `/restaurant/${restaurantId}`;
  }, []);

  const handleRequestLocation = useCallback(async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);
      setLocationError(null);
      setShowLocationAlert(false);
      
      // Update filters with location and default 20km radius
      dispatch(setFilters({
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: LocationService.DEFAULT_RADIUS_KM
      }));
    } catch (error) {
      console.warn('Manual location request failed:', error.message);
      setLocationError(error.message);
    }
  }, [dispatch]);

  const handleDismissLocationAlert = useCallback(() => {
    setShowLocationAlert(false);
  }, []);

  const handleLocationToggle = useCallback(() => {
    if (userLocation && filters.latitude && filters.longitude && filters.radiusKm) {
      // Disable location-based filtering
      dispatch(setFilters({
        latitude: undefined,
        longitude: undefined,
        radiusKm: undefined
      }));
      setUserLocation(null);
    } else {
      // Enable location-based filtering
      // If navbar has location, use it; otherwise request browser location
      if (currentLocation && currentLocation.lat && currentLocation.lng) {
        setUserLocation({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          address: currentLocation.address
        });
        dispatch(setFilters({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          radiusKm: LocationService.DEFAULT_RADIUS_KM
        }));
      } else {
        handleRequestLocation();
      }
    }
  }, [userLocation, filters.latitude, filters.longitude, filters.radiusKm, dispatch, handleRequestLocation, currentLocation]);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Memoize expensive computations
  const cuisineCategories = useMemo(() => {
    // Always start from predefined popular categories to keep them visible
    const baseNames = mockCategories.map(c => c.name);
    // Merge with whatever cuisines are present in current results (no duplicates)
    const dynamicNames = Array.from(new Set(restaurants.map(r => r.cuisine).filter(Boolean)));
    const merged = Array.from(new Set(['All', ...baseNames, ...dynamicNames]));
    return merged.map((name, idx) => ({ id: idx, name }));
  }, [restaurants]);

  const activeCuisineName = useMemo(() => filters.cuisine || 'All', [filters.cuisine]);
  
  const locationEnabled = useMemo(() => 
    userLocation && filters.latitude && filters.longitude && filters.radiusKm, 
    [userLocation, filters.latitude, filters.longitude, filters.radiusKm]
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <HomeHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSearch={handleSearch}
      />

      {/* Location Alert */}
      <Snackbar
        open={showLocationAlert}
        autoHideDuration={10000}
        onClose={handleDismissLocationAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleDismissLocationAlert}
          severity="info"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleRequestLocation}>
              Enable Location
            </Button>
          }
        >
          {locationError === 'Location access denied by user' 
            ? 'Enable location access or select a location in the navbar to see nearby restaurants within 20km'
            : 'Unable to detect your location. Select a location in the navbar or enable location access to see nearby restaurants.'}
        </Alert>
      </Snackbar>

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
          isPureVeg={filters.isPureVeg}
          locationEnabled={locationEnabled}
          onToggleNearby={handleLocationToggle}
          onTogglePureVeg={(checked) => dispatch(setFilters({ isPureVeg: checked ? true : undefined, page: 0 }))}
          onSelectSort={({ sortBy: sb, sortDir: sd }) => {
            if (!sb || !sd) {
              // Clear sorting to default
              dispatch(setFilters({ sortBy: 'name', sortDir: 'asc', page: 0 }));
            } else {
              dispatch(setFilters({ sortBy: sb, sortDir: sd, page: 0 }));
            }
          }}
        />


        {loading.restaurants && restaurants.length === 0 ? (
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

        {/* Pagination Controls */}
        {restaurants.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <Button 
              variant="contained"
              disabled={Boolean(restaurantsPage && restaurantsPage.last)}
              onClick={() => {
                const nextPage = (filters.page || 0) + 1;
                dispatch(setFilters({ page: nextPage }));
              }}
              sx={{ backgroundColor: '#fc8019', textTransform: 'none', '&:hover': { backgroundColor: '#e6730a' } }}
            >
              {restaurantsPage && restaurantsPage.last ? 'No more results' : (loading.restaurants ? 'Loading…' : 'Load More')}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
