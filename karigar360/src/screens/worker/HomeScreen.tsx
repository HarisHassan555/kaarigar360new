import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getBookings } from '../../services/firebase/bookingService';
import { updateWorkerStatus } from '../../services/firebase/workerService';
import { useAppSelector } from '../../store/hooks';
import { WorkerStackParamList } from '../../navigation/types';
import { Booking } from '../../types';
import { shadows, spacing, typography, borderRadius } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type NavigationProp = BottomTabNavigationProp<WorkerStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const { t } = useTranslation();
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
    if (hour < 12) return t('home.goodMorning');
    if (hour < 17) return t('home.goodAfternoon');
    return t('home.goodEvening');
  };

  const stats = getWorkerStats();

  const quickActions = [
    {
      title: t('myWork.title'),
      description: t('common.viewAssignedWork'),
      icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        navigation.navigate('BookingsTab');
      },
    },
    {
      title: 'Schedule',
      description: 'View your daily schedule and calendar',
      icon: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        navigation.navigate('ScheduleTab');
      },
    },
    {
      title: t('profile.title'),
      description: 'Update your work profile and skills',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {
        navigation.navigate('ProfileTab');
      },
    },
  ];

  const statsData = [
    {
      label: t('home.todaysJobs'),
      value: stats.todayJobs,
      icon: 'today-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: t('home.upcoming'),
      value: stats.upcomingJobs,
      icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: t('home.completed'),
      value: stats.completedJobs,
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: t('common.pending'),
      value: stats.pendingJobs,
      icon: 'hourglass-outline' as keyof typeof Ionicons.glyphMap,
    },
  ];

  const menuItems = [
    {
      title: t('home.tipsForSuccess'),
      icon: 'bulb-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {},
    },
    {
      title: t('home.keepProfileUpdated'),
      icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {},
    },
  ];

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Colored Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>WORKER DASHBOARD</Text>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.nameText}>{user?.profile.fullName || t('common.worker')}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.statusButton,
              isAvailable ? styles.statusButtonActive : styles.statusButtonInactive
            ]}
            onPress={toggleAvailabilityStatus}
            disabled={updatingStatus}
            activeOpacity={0.8}
          >
            <View style={[
              styles.statusDot,
              isAvailable ? styles.statusDotActive : styles.statusDotInactive
            ]} />
            <Text style={[
              styles.statusButtonText,
              isAvailable ? styles.statusButtonTextActive : styles.statusButtonTextInactive
            ]}>
              {updatingStatus ? t('home.updating') : (isAvailable ? t('home.available') : t('home.unavailable'))}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionLabel}>{t('home.yourWorkOverview')}</Text>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color={colors.primary} />
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions - List Style */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>{t('common.quickActions')}</Text>
          <View style={styles.menuCard}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < quickActions.length - 1 && styles.menuItemBorder
                ]}
                onPress={action.onPress}
                activeOpacity={0.6}
              >
                <Ionicons name={action.icon} size={22} color={colors.text} />
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{action.title}</Text>
                  <Text style={styles.menuItemDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity Card */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionLabel}>{t('home.recentActivity')}</Text>
          <View style={styles.activityCard}>
            {stats.pendingJobs > 0 ? (
              <>
                <View style={styles.activityHeader}>
                  <Ionicons name="notifications" size={20} color={colors.warning} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      {stats.pendingJobs === 1 
                        ? t('home.pendingRequests', { count: stats.pendingJobs })
                        : t('home.pendingRequestsPlural', { count: stats.pendingJobs })}
                    </Text>
                    <Text style={styles.activitySubtext}>
                      {t('home.checkMyWork')}
                    </Text>
                  </View>
                </View>
              </>
            ) : stats.upcomingJobs > 0 ? (
              <>
                <View style={styles.activityHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      {stats.upcomingJobs === 1
                        ? t('home.upcomingJobs', { count: stats.upcomingJobs })
                        : t('home.upcomingJobsPlural', { count: stats.upcomingJobs })}
                    </Text>
                    <Text style={styles.activitySubtext}>
                      {t('home.allSet')}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.activityHeader}>
                  <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{t('home.noRecentBookings')}</Text>
                    <Text style={styles.activitySubtext}>
                      {t('home.keepUpdated')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder
                ]}
                onPress={item.onPress}
                activeOpacity={0.6}
              >
                <Ionicons name={item.icon} size={22} color={colors.text} />
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
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
  // Colored Header Section
  headerSection: {
    backgroundColor: colors.primary,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
    opacity: 0.8,
    letterSpacing: 2,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  greetingText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs / 2,
  },
  nameText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  statusButtonActive: {
    backgroundColor: colors.white,
  },
  statusButtonInactive: {
    backgroundColor: colors.white,
    opacity: 0.9,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotInactive: {
    backgroundColor: colors.gray[400],
  },
  statusButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  statusButtonTextActive: {
    color: colors.success,
  },
  statusButtonTextInactive: {
    color: colors.gray[600],
  },
  // Content
  content: {
    paddingBottom: spacing.xl,
  },
  // Sections
  statsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  activitySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statNumber: {
    fontSize: typography.sizes.xxl + 4,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  // Menu Card
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuItemTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  menuItemDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  // Activity Card
  activityCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  activityText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  activitySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
