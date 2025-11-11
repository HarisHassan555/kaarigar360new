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
import { shadows, spacing, typography } from '../../utils/theme';

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
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
          names[workerId] = worker?.profile.fullName || 'Unknown Worker';
        } catch (error) {
          console.error('Error fetching worker:', error);
          names[workerId] = 'Unknown Worker';
        }
      }
      
      setWorkerNames(names);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
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
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateBookingStatus(bookingId, 'cancelled');
              loadBookings(); // Refresh the list
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getWorkerName = (workerId: string) => {
    return workerNames[workerId] || 'Loading...';
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
      case 'pending': return 'Pending Approval';
      case 'accepted': return 'Accepted';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
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

      <Text style={styles.workerName}>Worker: {getWorkerName(item.workerId)}</Text>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍 Location:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {item.status === 'pending' && (
          <Button
            title="Cancel"
            onPress={() => handleCancelBooking(item.id)}
            variant="outline"
            style={styles.actionButton}
          />
        )}
        {item.status === 'completed' && !getRatingForBooking(item.id) && (
          <Button
            title="Rate Worker"
            onPress={() => {
              // Navigate to rating screen
              navigation.navigate('Rating', { booking: item });
            }}
            style={styles.actionButton}
          />
        )}
        {item.status === 'completed' && getRatingForBooking(item.id) && (
          <View style={styles.ratedContainer}>
            <Text style={styles.ratedText}>✅ Rated</Text>
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
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>
          {filteredBookings.length} {filter === 'all' ? 'total' : filter} booking{filteredBookings.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('accepted', 'Accepted')}
        {renderFilterButton('completed', 'Completed')}
        {renderFilterButton('cancelled', 'Cancelled')}
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
                ? 'No bookings yet. Start by finding a worker!'
                : `No ${filter} bookings found`
              }
            </Text>
            {filter === 'all' && (
              <Button
                title="Find Workers"
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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