import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { getBookings, updateBookingStatus } from '../../services/firebase/bookingService';
import { getWorkerById } from '../../services/firebase/workerService';
import { useAppSelector } from '../../store/hooks';
import { Booking, Rating } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography, borderRadius } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');
  const [workerNames, setWorkerNames] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadBookings();
    loadRatings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userBookings = await getBookings(user.uid);
      setBookings(userBookings);
      
      // Fetch worker names for all bookings
      const workerIds = [...new Set(userBookings.map(booking => booking.workerId))];
      const names: {[key: string]: string} = {};
      
      for (const workerId of workerIds) {
        try {
          const worker = await getWorkerById(workerId);
          names[workerId] = worker?.profile.fullName || t('common.worker');
        } catch (error) {
          console.error('Error fetching worker:', error);
          names[workerId] = t('common.worker');
        }
      }
      
      setWorkerNames(names);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert(t('common.error'), t('myBookings.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    if (!user) return;

    try {
      // Get all ratings for this employer
      const { getFirebaseServices } = await import('../../services/firebase/init');
      const { db } = await getFirebaseServices();
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('employerId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const employerRatings = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
      } as Rating));

      setRatings(employerRatings);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const getRatingForBooking = (bookingId: string) => {
    return ratings.find(rating => rating.bookingId === bookingId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBookings(), loadRatings()]);
    setRefreshing(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      t('myBookings.cancelBooking'),
      t('myBookings.sureCancel'),
      [
        {
          text: t('myBookings.no'),
          style: 'cancel',
        },
        {
          text: t('myBookings.yesCancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              await updateBookingStatus(bookingId, 'cancelled');
              loadBookings(); // Refresh the list
              Alert.alert(t('common.success'), t('myBookings.bookingCancelled'));
            } catch (error) {
              Alert.alert(t('common.error'), t('myBookings.failedCancel'));
            }
          },
        },
      ]
    );
  };

  const getWorkerName = (workerId: string) => {
    return workerNames[workerId] || t('common.loading');
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.info;
      case 'completed': return colors.success;
      case 'cancelled': return colors.danger;
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('myBookings.pendingApproval');
      case 'accepted': return t('myBookings.accepted');
      case 'completed': return t('myBookings.completed');
      case 'cancelled': return t('myBookings.cancelled');
      default: return status;
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{item.task}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.workerName}>{t('myBookings.worker')} {getWorkerName(item.workerId)}</Text>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 {t('myBookings.date')}</Text>
          <Text style={styles.detailValue}>
            {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍 {t('myBookings.location')}</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {item.status === 'pending' && (
          <Button
            title={t('myBookings.cancel')}
            onPress={() => handleCancelBooking(item.id)}
            variant="outline"
            style={styles.actionButton}
          />
        )}
        {item.status === 'completed' && !getRatingForBooking(item.id) && (
          <Button
            title={t('myBookings.rateWorker')}
            onPress={() => {
              // Navigate to rating screen
              navigation.navigate('Rating', { booking: item });
            }}
            style={styles.actionButton}
          />
        )}
        {item.status === 'completed' && getRatingForBooking(item.id) && (
          <View style={styles.ratedContainer}>
            <Text style={styles.ratedText}>✅ {t('myBookings.rated')}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (filterValue: typeof filter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterValue && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterValue && styles.filterButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('myBookings.loadingBookings')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Colored Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>MY BOOKINGS</Text>
          <Text style={styles.headerSubtitle}>
            {filteredBookings.length} {filter === 'all' ? t('myBookings.total') : filter} {filteredBookings.length !== 1 ? t('myBookings.bookings') : t('myBookings.booking')}
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', t('search.all'))}
        {renderFilterButton('pending', t('myBookings.pendingApproval'))}
        {renderFilterButton('accepted', t('myBookings.accepted'))}
        {renderFilterButton('completed', t('myBookings.completed'))}
        {renderFilterButton('cancelled', t('myBookings.cancelled'))}
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? t('myBookings.noBookingsYet')
                : t('myBookings.noFilterBookings', { filter })
              }
            </Text>
            {filter === 'all' && (
              <Button
                title={t('myBookings.findWorkers')}
                onPress={() => {
                  // Navigate to worker search
                  console.log('Navigate to worker search');
                }}
                style={styles.emptyButton}
              />
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  // Header Section
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
    fontWeight: '700' as any,
    color: colors.white,
    opacity: 0.8,
    letterSpacing: 2,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.9,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  bookingsList: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  taskTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  workerName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  bookingDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 100,
    marginLeft: spacing.sm,
  },
  ratedContainer: {
    minWidth: 100,
    marginLeft: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratedText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 150,
  },
}); 