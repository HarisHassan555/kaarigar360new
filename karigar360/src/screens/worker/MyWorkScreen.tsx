import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { getBookings, updateBookingStatus, submitRating } from '../../services/firebase/bookingService';
import { getWorkerRatings } from '../../services/firebase/workerService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Booking, Rating } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography } from '../../utils/theme';

export const MyWorkScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'accepted' | 'completed'>('pending');

  useEffect(() => {
    loadBookings();
    loadRatings();
  }, []);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const workerBookings = await getBookings(undefined, user.uid);
      setBookings(workerBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    if (!user) return;

    try {
      const workerRatings = await getWorkerRatings(user.uid);
      setRatings(workerRatings);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBookings(), loadRatings()]);
    setRefreshing(false);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'accepted');
      Alert.alert('Success', 'Booking accepted successfully!');
      loadBookings(); // Refresh the list
    } catch (error) {
      console.error('Error accepting booking:', error);
      Alert.alert('Error', 'Failed to accept booking. Please try again.');
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    Alert.alert(
      'Decline Booking',
      'Are you sure you want to decline this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateBookingStatus(bookingId, 'cancelled');
              Alert.alert('Success', 'Booking declined successfully!');
              loadBookings(); // Refresh the list
            } catch (error) {
              console.error('Error declining booking:', error);
              Alert.alert('Error', 'Failed to decline booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getFilteredBookings = () => {
    switch (selectedTab) {
      case 'pending':
        return bookings.filter(booking => booking.status === 'pending');
      case 'accepted':
        return bookings.filter(booking => booking.status === 'accepted');
      case 'completed':
        return bookings.filter(booking => booking.status === 'completed');
      default:
        return bookings;
    }
  };

  const getRatingForBooking = (bookingId: string) => {
    return ratings.find(rating => rating.bookingId === bookingId);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'accepted':
        return colors.success;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderBookingCard = ({ item: booking }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.taskTitle}>{booking.task}</Text>
          <Text style={styles.bookingDate}>
            {formatDate(booking.date)} at {formatTime(booking.date)}
          </Text>
          <Text style={styles.bookingLocation}>📍 {booking.location.address}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {getStatusText(booking.status)}
          </Text>
        </View>
      </View>

      {booking.description && (
        <Text style={styles.bookingDescription}>{booking.description}</Text>
      )}

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusColor(booking.status) }]}>
            {getStatusText(booking.status)}
          </Text>
        </View>
      </View>

      {booking.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Button
            title="Decline"
            onPress={() => handleDeclineBooking(booking.id)}
            variant="outline"
            style={[styles.actionButton, styles.declineButton] as any}
          />
          <Button
            title="Accept"
            onPress={() => handleAcceptBooking(booking.id)}
            style={[styles.actionButton, styles.acceptButton] as any}
          />
        </View>
      )}

      {booking.status === 'accepted' && (
        <View style={styles.acceptedInfo}>
          <Text style={styles.acceptedText}>
            ✅ You have accepted this booking. The employer will be notified.
          </Text>
        </View>
      )}

      {booking.status === 'completed' && (
        <View style={styles.completedInfo}>
          <Text style={styles.completedText}>
            🎉 This booking has been completed successfully!
          </Text>
          {(() => {
            const rating = getRatingForBooking(booking.id);
            return rating ? (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Your Rating:</Text>
                <StarRating rating={rating.rating} size="sm" showText />
                {rating.review && (
                  <Text style={styles.reviewText}>"{rating.review}"</Text>
                )}
              </View>
            ) : (
              <Text style={styles.noRatingText}>
                No rating received yet
              </Text>
            );
          })()}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No {selectedTab} bookings</Text>
      <Text style={styles.emptyDescription}>
        {selectedTab === 'pending' 
          ? "You don't have any pending booking requests at the moment."
          : `You don't have any ${selectedTab} bookings at the moment.`
        }
      </Text>
    </View>
  );

  const renderTabButton = (tab: 'pending' | 'accepted' | 'completed', label: string, count: number) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === tab && styles.activeTabButton,
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        selectedTab === tab && styles.activeTabButtonText,
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'accepted').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your work...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Work</Text>
        <Text style={styles.subtitle}>Manage your bookings and work requests</Text>
      </View>

      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          {renderTabButton('pending', 'Pending', pendingCount)}
          {renderTabButton('accepted', 'Accepted', acceptedCount)}
          {renderTabButton('completed', 'Completed', completedCount)}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={getFilteredBookings()}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
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
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  tabButton: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeTabButtonText: {
    color: colors.white,
  },
  listContainer: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bookingInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bookingDate: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  bookingLocation: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  bookingDescription: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  declineButton: {
    borderColor: colors.danger,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptedInfo: {
    backgroundColor: colors.success + '10',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  acceptedText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '500',
  },
  completedInfo: {
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  completedText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  noRatingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    minHeight: 200,
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
