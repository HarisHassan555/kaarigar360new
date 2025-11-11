import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { WorkerNavigator } from './WorkerNavigator';
import { UserRole } from '../types/auth';
import { useAppSelector } from '../store/hooks';

// Import your stack navigators here
// import EmployerNavigator from './EmployerNavigator';
// import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const userRole: UserRole = user?.role || 'worker';

  // Show loading screen while checking authentication (only on initial load)
  if (isLoading && !isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {userRole === 'employer' && (
              <Stack.Screen
                name="EmployerMain"
                component={() => <></>} // Replace with EmployerNavigator
              />
            )}
            {userRole === 'worker' && (
              <Stack.Screen
                name="WorkerMain"
                component={WorkerNavigator}
              />
            )}
            {userRole === 'admin' && (
              <Stack.Screen
                name="AdminMain"
                component={() => <></>} // Replace with AdminNavigator
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 