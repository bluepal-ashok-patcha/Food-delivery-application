import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Comprehensive area data for accurate geocoding
const mockAreas = [
  // Central Hyderabad
  { lat: 17.4065, lng: 78.4772, address: 'Banjara Hills, Hyderabad, Telangana', area: 'Banjara Hills' },
  { lat: 17.4333, lng: 78.4167, address: 'Jubilee Hills, Hyderabad, Telangana', area: 'Jubilee Hills' },
  { lat: 17.4156, lng: 78.4347, address: 'Begumpet, Hyderabad, Telangana', area: 'Begumpet' },
  { lat: 17.3850, lng: 78.4867, address: 'Secunderabad, Hyderabad, Telangana', area: 'Secunderabad' },
  
  // IT Corridor
  { lat: 17.4488, lng: 78.3908, address: 'HITEC City, Madhapur, Hyderabad, Telangana', area: 'HITEC City' },
  { lat: 17.4239, lng: 78.4738, address: 'Gachibowli, Hyderabad, Telangana', area: 'Gachibowli' },
  { lat: 17.4399, lng: 78.4983, address: 'Kondapur, Hyderabad, Telangana', area: 'Kondapur' },
  { lat: 17.4565, lng: 78.3654, address: 'Cyberabad, Hyderabad, Telangana', area: 'Cyberabad' },
  
  // Old City
  { lat: 17.3616, lng: 78.4747, address: 'Charminar, Old City, Hyderabad, Telangana', area: 'Charminar' },
  { lat: 17.3750, lng: 78.4800, address: 'Mehdipatnam, Hyderabad, Telangana', area: 'Mehdipatnam' },
  { lat: 17.3500, lng: 78.4500, address: 'Falaknuma, Hyderabad, Telangana', area: 'Falaknuma' },
  
  // North Hyderabad
  { lat: 17.5000, lng: 78.4000, address: 'Kukatpally, Hyderabad, Telangana', area: 'Kukatpally' },
  { lat: 17.5200, lng: 78.4200, address: 'Bachupally, Hyderabad, Telangana', area: 'Bachupally' },
  { lat: 17.4800, lng: 78.3800, address: 'Miyapur, Hyderabad, Telangana', area: 'Miyapur' },
  
  // South Hyderabad
  { lat: 17.3200, lng: 78.5000, address: 'Lakdikapul, Hyderabad, Telangana', area: 'Lakdikapul' },
  { lat: 17.3000, lng: 78.4800, address: 'Malakpet, Hyderabad, Telangana', area: 'Malakpet' },
  { lat: 17.2800, lng: 78.4600, address: 'Dilsukhnagar, Hyderabad, Telangana', area: 'Dilsukhnagar' }
];

// Async thunk for auto-detecting location
export const detectCurrentLocation = createAsyncThunk(
  'location/detectCurrentLocation',
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(rejectWithValue('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=16&addressdetails=1`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            const data = await res.json();
            const address = data?.display_name || [
              data?.address?.suburb,
              data?.address?.city || data?.address?.town || data?.address?.village,
              data?.address?.state
            ].filter(Boolean).join(', ');
            resolve({ lat: latitude, lng: longitude, address: address || 'Current Location' });
          } catch (e) {
            resolve({ lat: latitude, lng: longitude, address: 'Current Location' });
          }
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          reject(rejectWithValue(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }
);

// Async thunk for geocoding (converting coordinates to address)
export const geocodeLocation = createAsyncThunk(
  'location/geocodeLocation',
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=16&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) throw new Error('Reverse geocoding failed');
      const data = await res.json();
      const address = data?.display_name || [
        data?.address?.suburb,
        data?.address?.city || data?.address?.town || data?.address?.village,
        data?.address?.state
      ].filter(Boolean).join(', ');
      return { address: address || 'Selected Location', lat, lng };
    } catch (error) {
      return rejectWithValue('Failed to get address for this location.');
    }
  }
);

// Async thunk for reverse geocoding (converting address to coordinates)
export const reverseGeocodeLocation = createAsyncThunk(
  'location/reverseGeocodeLocation',
  async (query, { rejectWithValue }) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&limit=1&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) throw new Error('Geocoding failed');
      const json = await res.json();
      const result = json && json[0];
      if (!result) throw new Error('No results');
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const address = result.display_name || query;
      return { lat, lng, address };
    } catch (error) {
      return rejectWithValue('Failed to get coordinates for this address.');
    }
  }
);

const initialState = {
  currentLocation: {
    lat: 17.4065,
    lng: 78.4772,
    address: 'Banjara Hills, Hyderabad, Telangana'
  },
  // Latest coordinates picked in map modal (raw), independent of reverse geocoded currentLocation
  selectedCoordinates: null,
  isDetectingLocation: false,
  isGeocoding: false,
  isReverseGeocoding: false,
  locationError: null,
  isLocationModalOpen: false,
  isMapModalOpen: false,
  mapCenter: { lat: 17.4065, lng: 78.4772 }
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      state.locationError = null;
    },
    setSelectedCoordinates: (state, action) => {
      state.selectedCoordinates = action.payload; // { lat, lng }
    },
    openLocationModal: (state) => {
      state.isLocationModalOpen = true;
    },
    closeLocationModal: (state) => {
      state.isLocationModalOpen = false;
      state.locationError = null;
    },
    openMapModal: (state) => {
      state.isMapModalOpen = true;
    },
    closeMapModal: (state) => {
      state.isMapModalOpen = false;
    },
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    clearLocationError: (state) => {
      state.locationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(detectCurrentLocation.pending, (state) => {
        state.isDetectingLocation = true;
        state.locationError = null;
      })
      .addCase(detectCurrentLocation.fulfilled, (state, action) => {
        state.isDetectingLocation = false;
        state.currentLocation = {
          lat: action.payload.lat,
          lng: action.payload.lng,
          address: action.payload.address
        };
      })
      .addCase(detectCurrentLocation.rejected, (state, action) => {
        state.isDetectingLocation = false;
        state.locationError = action.payload;
      })
      .addCase(geocodeLocation.pending, (state) => {
        state.isGeocoding = true;
        state.locationError = null;
      })
      .addCase(geocodeLocation.fulfilled, (state, action) => {
        state.isGeocoding = false;
        state.currentLocation = {
          lat: action.payload.lat,
          lng: action.payload.lng,
          address: action.payload.address
        };
      })
      .addCase(geocodeLocation.rejected, (state, action) => {
        state.isGeocoding = false;
        state.locationError = action.payload;
      })
      .addCase(reverseGeocodeLocation.pending, (state) => {
        state.isReverseGeocoding = true;
        state.locationError = null;
      })
      .addCase(reverseGeocodeLocation.fulfilled, (state, action) => {
        state.isReverseGeocoding = false;
        state.currentLocation = {
          lat: action.payload.lat,
          lng: action.payload.lng,
          address: action.payload.address
        };
      })
      .addCase(reverseGeocodeLocation.rejected, (state, action) => {
        state.isReverseGeocoding = false;
        state.locationError = action.payload;
      });
  }
});

export const {
  setCurrentLocation,
  setSelectedCoordinates,
  openLocationModal,
  closeLocationModal,
  openMapModal,
  closeMapModal,
  setMapCenter,
  clearLocationError
} = locationSlice.actions;

export default locationSlice.reducer;
