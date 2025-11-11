import React, { useEffect, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../utils/theme';

interface DashboardStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  activeBookings: number;
  completedBookings: number;
  pendingDisputes: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'booking_created' | 'dispute_reported' | 'payment_completed';
  description: string;
  timestamp: Date;
}

const StatCard: React.FC<{ title: string; value: string | number; color: string; icon: string }> = ({
  title,
  value,
  color,
  icon,
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statIcon}>
      <Text style={styles.statIconText}>{icon}</Text>
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'booking_created': return '📋';
      case 'dispute_reported': return '⚠️';
      case 'payment_completed': return '💰';
      default: return '📝';
    }
  };

  return (
    <View style={styles.activityItem}>
      <Text style={styles.activityIcon}>{getActivityIcon(activity.type)}</Text>
      <View style={styles.activityContent}>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTime}>
          {activity.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingDisputes: 0,
    totalRevenue: 0,
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockStats: DashboardStats = {
    totalUsers: 1250,
    totalWorkers: 750,
    totalEmployers: 500,
    activeBookings: 45,
    completedBookings: 1850,
    pendingDisputes: 8,
    totalRevenue: 2850000,
  };

  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_registration',
      description: 'New worker Ahmad Khan registered',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      type: 'booking_created',
      description: 'Electrical work booking created in DHA Phase 5',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: '3',
      type: 'dispute_reported',
      description: 'Payment dispute reported for booking #1234',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '4',
      type: 'payment_completed',
      description: 'Payment of PKR 3,500 completed for plumbing work',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
    },
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const QuickActionButton: React.FC<{ title: string; icon: string; onPress: () => void; color: string }> = ({
    title,
    icon,
    onPress,
    color,
  }) => (
    <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: color + '20' }]} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Kaarigar360 Management Panel</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              color={colors.primary}
              icon="👥"
            />
            <StatCard
              title="Workers"
              value={stats.totalWorkers.toLocaleString()}
              color={colors.success}
              icon="🔧"
            />
            <StatCard
              title="Employers"
              value={stats.totalEmployers.toLocaleString()}
              color={colors.info}
              icon="👔"
            />
            <StatCard
              title="Active Bookings"
              value={stats.activeBookings}
              color={colors.warning}
              icon="📋"
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedBookings.toLocaleString()}
              color={colors.success}
              icon="✅"
            />
            <StatCard
              title="Pending Disputes"
              value={stats.pendingDisputes}
              color={colors.danger}
              icon="⚠️"
            />
          </View>
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <Text style={styles.revenueTitle}>Total Platform Revenue</Text>
          <Text style={styles.revenueAmount}>PKR {stats.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.revenueSubtext}>Generated from completed bookings</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Manage Users"
              icon="👤"
              color={colors.primary}
              onPress={() => console.log('Manage Users')}
            />
            <QuickActionButton
              title="View Disputes"
              icon="⚖️"
              color={colors.danger}
              onPress={() => console.log('View Disputes')}
            />
            <QuickActionButton
              title="Analytics"
              icon="📊"
              color={colors.info}
              onPress={() => console.log('Analytics')}
            />
            <QuickActionButton
              title="Settings"
              icon="⚙️"
              color={colors.gray[600]}
              onPress={() => console.log('Settings')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <FlatList
            data={activities}
            renderItem={({ item }) => <ActivityItem activity={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginBottom: spacing.md,
  },
  statsContainer: {
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  statIcon: {
    marginRight: spacing.sm,
  },
  statIconText: {
    fontSize: typography.sizes.xl,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginBottom: spacing.xs / 2,
  },
  statTitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  revenueCard: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  revenueTitle: {
    fontSize: typography.sizes.md,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  revenueAmount: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  revenueSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.8,
  },
  quickActionsContainer: {
    padding: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quickActionIcon: {
    fontSize: typography.sizes.xl,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  activityContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  activityIcon: {
    fontSize: typography.sizes.lg,
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: typography.sizes.sm,
    color: colors.dark,
    marginBottom: spacing.xs / 2,
  },
  activityTime: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
}); 