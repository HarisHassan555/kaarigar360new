import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
  profileEditMode: boolean;
}

const initialState: UserState = {
  preferences: {
    notifications: true,
    darkMode: false,
    language: 'en',
  },
  profileEditMode: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.preferences.notifications = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.preferences.darkMode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload;
    },
    toggleProfileEditMode: (state) => {
      state.profileEditMode = !state.profileEditMode;
    },
    setProfileEditMode: (state, action: PayloadAction<boolean>) => {
      state.profileEditMode = action.payload;
    },
  },
});

export const { 
  setNotifications, 
  setDarkMode, 
  setLanguage, 
  toggleProfileEditMode, 
  setProfileEditMode 
} = userSlice.actions;

export default userSlice.reducer; 