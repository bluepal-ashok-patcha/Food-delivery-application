import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock location data with Indian addresses
const mockSavedAddresses = [
  {
    id: 1,
    type: 'home',
    name: 'Home',
    address: '123 MG Road, Banjara Hills, Hyderabad, Telangana 500034',
    coordinates: { lat: 17.4065, lng: 78.4772 },
    isDefault: true
  },
  {
    id: 2,
    type: 'work',
    name: 'Office',
    address: '456 HITEC City, Madhapur, Hyderabad, Telangana 500081',
    coordinates: { lat: 17.4488, lng: 78.3908 },
    isDefault: false
  },
  {
    id: 3,
    type: 'other',
    name: 'Mom\'s House',
    address: '789 Jubilee Hills, Hyderabad, Telangana 500033',
    coordinates: { lat: 17.4333, lng: 78.4167 },
    isDefault: false
  }
];

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
          
          // Find closest mock area with improved distance calculation
          let closestArea = mockAreas[0];
          let minDistance = Infinity;
          
          mockAreas.forEach(area => {
            // Haversine distance calculation for more accuracy
            const R = 6371; // Earth's radius in kilometers
            const dLat = (area.lat - latitude) * Math.PI / 180;
            const dLng = (area.lng - longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(latitude * Math.PI / 180) * Math.cos(area.lat * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            if (distance < minDistance) {
              minDistance = distance;
              closestArea = area;
            }
          });
          
          resolve({
            lat: latitude,
            lng: longitude,
            address: closestArea.address
          });
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find closest mock area with Haversine distance
      let closestArea = mockAreas[0];
      let minDistance = Infinity;
      
      mockAreas.forEach(area => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (area.lat - lat) * Math.PI / 180;
        const dLng = (area.lng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(area.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        if (distance < minDistance) {
          minDistance = distance;
          closestArea = area;
        }
      });
      
      return {
        address: closestArea.address,
        lat,
        lng
      };
    } catch (error) {
      return rejectWithValue('Failed to get address for this location.');
    }
  }
);

// Async thunk for reverse geocoding (converting address to coordinates)
export const reverseGeocodeLocation = createAsyncThunk(
  'location/reverseGeocodeLocation',
  async (address, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find matching area by address with improved search
      const searchTerms = address.toLowerCase().split(' ');
      const matchingArea = mockAreas.find(area => {
        const areaName = area.area.toLowerCase();
        const areaAddress = area.address.toLowerCase();
        
        // Check if any search term matches area name or address
        return searchTerms.some(term => 
          areaName.includes(term) || 
          areaAddress.includes(term) ||
          term.includes(areaName.split(' ')[0]) // Partial match for area names
        );
      });
      
      if (matchingArea) {
        return {
          lat: matchingArea.lat,
          lng: matchingArea.lng,
          address: matchingArea.address
        };
      }
      
      // If no exact match, return first area as fallback
      return {
        lat: mockAreas[0].lat,
        lng: mockAreas[0].lng,
        address: mockAreas[0].address
      };
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
  savedAddresses: mockSavedAddresses,
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
    addSavedAddress: (state, action) => {
      const newAddress = {
        ...action.payload,
        id: Date.now(),
        isDefault: state.savedAddresses.length === 0
      };
      state.savedAddresses.push(newAddress);
    },
    updateSavedAddress: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.savedAddresses.findIndex(addr => addr.id === id);
      if (index !== -1) {
        state.savedAddresses[index] = { ...state.savedAddresses[index], ...updates };
      }
    },
    deleteSavedAddress: (state, action) => {
      state.savedAddresses = state.savedAddresses.filter(addr => addr.id !== action.payload);
    },
    setDefaultAddress: (state, action) => {
      // Remove default from all addresses
      state.savedAddresses.forEach(addr => addr.isDefault = false);
      // Set new default
      const index = state.savedAddresses.findIndex(addr => addr.id === action.payload);
      if (index !== -1) {
        state.savedAddresses[index].isDefault = true;
        state.currentLocation = {
          lat: state.savedAddresses[index].coordinates.lat,
          lng: state.savedAddresses[index].coordinates.lng,
          address: state.savedAddresses[index].address
        };
      }
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
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  openLocationModal,
  closeLocationModal,
  openMapModal,
  closeMapModal,
  setMapCenter,
  clearLocationError
} = locationSlice.actions;

export default locationSlice.reducer;
