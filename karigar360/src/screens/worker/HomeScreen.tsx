import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { getBookings } from '../../services/firebase/bookingService';
import { updateWorkerStatus } from '../../services/firebase/workerService';
import { useAppSelector } from '../../store/hooks';
import { WorkerStackParamList } from '../../navigation/types';
import { Booking } from '../../types';
import { shadows, spacing, typography } from '../../utils/theme';

type NavigationProp = BottomTabNavigationProp<WorkerStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadBookings();
    loadWorkerStatus();
  }, []);

  const loadWorkerStatus = () => {
    if (user && 'availabilityStatus' in user) {
      setIsAvailable(user.availabilityStatus === 'available' || user.availabilityStatus === undefined);
    }
  };

  const toggleAvailabilityStatus = async () => {
    if (!user || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      const newStatus = isAvailable ? 'unavailable' : 'available';
      await updateWorkerStatus(user.uid, newStatus);
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Error updating worker status:', error);
      // You could show an alert here if needed
    } finally {
      setUpdatingStatus(false);
    }
  };

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const workerBookings = await getBookings(undefined, user.uid);
      setBookings(workerBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkerStats = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.toISOString().split('T')[0] === todayStr;
    });

    const upcomingBookings = bookings.filter(booking => booking.status === 'accepted');
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    const pendingBookings = bookings.filter(booking => booking.status === 'pending');

    return {
      todayJobs: todayBookings.length,
      upcomingJobs: upcomingBookings.length,
      completedJobs: completedBookings.length,
      pendingJobs: pendingBookings.length,
    };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = getWorkerStats();

  const quickActions = [
    {
      title: 'My Work',
      description: 'Manage your bookings and work requests',
      icon: '📋',
      onPress: () => {
        navigation.navigate('BookingsTab');
      },
    },
    {
      title: 'Schedule',
      description: 'View your daily schedule and calendar',
      icon: '📅',
      onPress: () => {
        navigation.navigate('ScheduleTab');
      },
    },
    {
      title: 'Profile',
      description: 'Update your work profile and skills',
      icon: '👤',
      onPress: () => {
        navigation.navigate('ProfileTab');
      },
    },
  ];

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{getGreeting()},</Text>
          <Text style={styles.nameText}>{user?.profile.fullName || 'Worker'}!</Text>
          <Text style={styles.subtitleText}>Ready to find your next job opportunity?</Text>
          <TouchableOpacity 
            style={styles.statusContainer} 
            onPress={toggleAvailabilityStatus}
            disabled={updatingStatus}
          >
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={[
              styles.statusBadge,
              isAvailable ? styles.availableBadge : styles.unavailableBadge
            ]}>
              <Text style={[
                styles.statusText,
                isAvailable ? styles.availableText : styles.unavailableText
              ]}>
                {updatingStatus ? 'Updating...' : (isAvailable ? 'Available' : 'Unavailable')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Worker Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Work Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.todayJobs}</Text>
              <Text style={styles.statLabel}>Today's Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.upcomingJobs}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.completedJobs}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.pendingJobs}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Worker Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>Keep your profile updated with recent skills and experience</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>⏰</Text>
              <Text style={styles.tipText}>Respond to booking requests quickly to increase your chances</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>⭐</Text>
              <Text style={styles.tipText}>Maintain high ratings by delivering quality work on time</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {stats.pendingJobs > 0 ? (
              <>
                <Text style={styles.activityText}>You have {stats.pendingJobs} pending booking request{stats.pendingJobs !== 1 ? 's' : ''}</Text>
                <Text style={styles.activitySubtext}>
                  Check your My Work section to review and respond to new opportunities
                </Text>
              </>
            ) : stats.upcomingJobs > 0 ? (
              <>
                <Text style={styles.activityText}>You have {stats.upcomingJobs} upcoming job{stats.upcomingJobs !== 1 ? 's' : ''}</Text>
                <Text style={styles.activitySubtext}>
                  Great! You're all set for your upcoming work assignments
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.activityText}>No recent bookings</Text>
                <Text style={styles.activitySubtext}>
                  Keep your profile updated and check back regularly for new opportunities
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nameText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitleText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '500',
  },
  availableBadge: {
    backgroundColor: colors.success + '20',
  },
  unavailableBadge: {
    backgroundColor: colors.textSecondary + '20',
  },
  availableText: {
    color: colors.success,
  },
  unavailableText: {
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.md,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.sm,
  },
  activityText: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  activitySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    ...shadows.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
}); 