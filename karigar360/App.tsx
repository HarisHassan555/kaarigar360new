import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import './src/i18n'; // Initialize i18n
import { useFirebaseInit } from './src/hooks/useFirebaseInit';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { EmployerNavigator } from './src/navigation/EmployerNavigator';
import { WorkerNavigator } from './src/navigation/WorkerNavigator';
import { StatusCheckScreen } from './src/screens/auth/StatusCheckScreen';
import { store } from './src/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { initializeAuth, loadStoredUser } from './src/store/slices/authSlice';
import { colors } from './src/utils/theme';
import { changeLanguage } from './src/i18n';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { preferences } = useAppSelector((state) => state.user);
  const { isInitialized: firebaseInitialized, error: firebaseError } = useFirebaseInit();

  useEffect(() => {
    // Initialize Firebase Auth and load stored user
    const initializeApp = async () => {
      if (!firebaseInitialized) return;
      
      try {
        await initializeAuth();
        dispatch(loadStoredUser());
        // Sync i18n with Redux language preference
        if (preferences.language) {
          await changeLanguage(preferences.language as 'en' | 'ur');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Still try to load stored user even if Firebase fails
        dispatch(loadStoredUser());
      }
    };
    
    initializeApp();
  }, [dispatch, firebaseInitialized, preferences.language]);

  if (isLoading || !firebaseInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.gray[600] }}>
          {!firebaseInitialized ? 'Initializing Firebase...' : 'Loading...'}
        </Text>
        {firebaseError && (
          <Text style={{ marginTop: 8, color: colors.error, textAlign: 'center', paddingHorizontal: 20 }}>
            Firebase Error: {firebaseError}
          </Text>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer key={preferences.language}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user?.status === 'approved' ? (
          <>
            {user?.role === 'employer' && (
              <Stack.Screen name="EmployerMain" component={EmployerNavigator} />
            )}
            {user?.role === 'worker' && (
              <Stack.Screen name="WorkerMain" component={WorkerNavigator} />
            )}
          </>
        ) : (
          <Stack.Screen name="StatusCheck" component={StatusCheckScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
} 