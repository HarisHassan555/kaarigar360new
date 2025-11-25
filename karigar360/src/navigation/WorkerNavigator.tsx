import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/worker/HomeScreen';
import { MyWorkScreen } from '../screens/worker/MyWorkScreen';
import { ProfileScreen } from '../screens/worker/ProfileScreen';
import { ScheduleScreen } from '../screens/worker/ScheduleScreen';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../utils/theme';
import { WorkerStackParamList } from './types';

const Tab = createBottomTabNavigator<WorkerStackParamList>();

export const WorkerNavigator: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={MyWorkScreen}
        options={{
          tabBarLabel: 'My Work',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 