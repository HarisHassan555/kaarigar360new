import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { onAuthStateChanged } from 'firebase/auth';
import {
  createUserAccount,
  getCurrentUserData,
  signInUser,
  signOutUser,
  updateUserProfile
} from '../../services/firebase/authService';
import { getFirebaseServices } from '../../services/firebase/init';
import { User } from '../../types/index';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Initialize Firebase Auth state listener
export const initializeAuth = () => {
  return new Promise<void>(async (resolve) => {
    try {
      const { auth } = await getFirebaseServices();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userData = await getCurrentUserData(firebaseUser);
            if (userData) {
              // Store user data regardless of status for status check screen
              await AsyncStorage.setItem('@kaarigar360:user', JSON.stringify(userData));
            }
          } catch (error) {
            console.error('Error getting user data:', error);
            // Clear stored user data on error
            await AsyncStorage.removeItem('@kaarigar360:user');
          }
        } else {
          // Clear stored user data
          await AsyncStorage.removeItem('@kaarigar360:user');
        }
        resolve();
      });
    } catch (error) {
      console.error('Error initializing Firebase Auth:', error);
      resolve();
    }
  });
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const userData = await signInUser(email, password);
      
      // Convert dates to ISO strings for serialization
      const serializedUser = {
        ...userData,
        createdAt: (userData.createdAt as any)?.toDate ? (userData.createdAt as any).toDate().toISOString() : 
                   userData.createdAt || new Date().toISOString(),
        updatedAt: (userData.updatedAt as any)?.toDate ? (userData.updatedAt as any).toDate().toISOString() : 
                   userData.updatedAt || new Date().toISOString(),
      };
      
      // Store user in AsyncStorage
      await AsyncStorage.setItem('@kaarigar360:user', JSON.stringify(serializedUser));
      
      return serializedUser;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, userData }: { 
    email: string; 
    password: string; 
    userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'> 
  }) => {
    try {
      const newUser = await createUserAccount(email, password, userData);
      
      // Convert dates to ISO strings for serialization
      const serializedUser = {
        ...newUser,
        createdAt: (newUser.createdAt as any)?.toDate ? (newUser.createdAt as any).toDate().toISOString() : 
                   newUser.createdAt || new Date().toISOString(),
        updatedAt: (newUser.updatedAt as any)?.toDate ? (newUser.updatedAt as any).toDate().toISOString() : 
                   newUser.updatedAt || new Date().toISOString(),
      };
      
      // Store user in AsyncStorage
      await AsyncStorage.setItem('@kaarigar360:user', JSON.stringify(serializedUser));
      
      return serializedUser;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }
);

export const loadStoredUser = createAsyncThunk(
  'auth/loadStoredUser',
  async () => {
    const userData = await AsyncStorage.getItem('@kaarigar360:user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Ensure dates are properly formatted strings
      return {
        ...parsedUser,
        createdAt: parsedUser.createdAt,
        updatedAt: parsedUser.updatedAt,
      };
    }
    return null;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await signOutUser();
      await AsyncStorage.removeItem('@kaarigar360:user');
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updatedData: Partial<User['profile']>, { getState }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await updateUserProfile(auth.user.uid, updatedData);
      
      // Convert dates to ISO strings for serialization
      const serializedUser = {
        ...updatedUser,
        createdAt: (updatedUser.createdAt as any)?.toDate ? (updatedUser.createdAt as any).toDate().toISOString() : 
                   updatedUser.createdAt || new Date().toISOString(),
        updatedAt: (updatedUser.updatedAt as any)?.toDate ? (updatedUser.updatedAt as any).toDate().toISOString() : 
                   updatedUser.updatedAt || new Date().toISOString(),
      };

      // Store updated user in AsyncStorage
      await AsyncStorage.setItem('@kaarigar360:user', JSON.stringify(serializedUser));

      return serializedUser;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }
);

// Refresh user data from Firebase
export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (_, { getState }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.user) {
      throw new Error('No user logged in');
    }

    try {
      const { auth: firebaseAuth } = await getFirebaseServices();
      const userData = await getCurrentUserData(firebaseAuth.currentUser);
      if (userData) {
        // Convert dates to ISO strings for serialization
        const serializedUser = {
          ...userData,
          createdAt: (userData.createdAt as any)?.toDate ? (userData.createdAt as any).toDate().toISOString() : 
                     userData.createdAt || new Date().toISOString(),
          updatedAt: (userData.updatedAt as any)?.toDate ? (userData.updatedAt as any).toDate().toISOString() : 
                     userData.updatedAt || new Date().toISOString(),
        };

        // Store updated user in AsyncStorage
        await AsyncStorage.setItem('@kaarigar360:user', JSON.stringify(serializedUser));
        return serializedUser;
      }
      throw new Error('User data not found');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to refresh user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Load stored user
      .addCase(loadStoredUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadStoredUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Profile update failed';
      })
      // Refresh user data
      .addCase(refreshUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to refresh user data';
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 