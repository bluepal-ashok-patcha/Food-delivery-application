import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Handle nested response structure from backend
      const userData = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      // Debug logs removed for production
      
      // Store JWT token
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      
      // Handle nested response structure from backend
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      // Store JWT token if provided
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  userRole: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.userRole = null;
      state.error = null;
      try { 
        localStorage.removeItem('auth'); 
        localStorage.removeItem('authToken');
      } catch {}
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.userRole = (action.payload.role || '').toLowerCase();
        state.error = null;
        try { localStorage.setItem('auth', JSON.stringify({ user: state.user, userRole: state.userRole })); } catch {}
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.userRole = (action.payload.role || '').toLowerCase();
        state.error = null;
        try { localStorage.setItem('auth', JSON.stringify({ user: state.user, userRole: state.userRole })); } catch {}
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
