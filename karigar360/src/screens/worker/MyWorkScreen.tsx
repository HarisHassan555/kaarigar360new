import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { getBookings, updateBookingStatus, submitRating } from '../../services/firebase/bookingService';
import { getWorkerRatings } from '../../services/firebase/workerService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Booking, Rating } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography, borderRadius } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

export const MyWorkScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const { t } = useTranslation();
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
      Alert.alert(t('common.error'), t('myWork.failedLoad'));
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
      Alert.alert(t('common.success'), t('myWork.bookingAccepted'));
      loadBookings();
    } catch (error) {
      console.error('Error accepting booking:', error);
      Alert.alert(t('common.error'), t('myWork.failedAccept'));
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    Alert.alert(
      t('myWork.declineBooking'),
      t('myWork.sureDecline'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('myWork.decline'),
          style: 'destructive',
          onPress: async () => {
            try {
              await updateBookingStatus(bookingId, 'cancelled');
              Alert.alert(t('common.success'), t('myWork.bookingDeclined'));
              loadBookings();
            } catch (error) {
              console.error('Error declining booking:', error);
              Alert.alert(t('common.error'), t('myWork.failedDecline'));
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

  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const statusColor = getStatusColor(booking.status);
    const rating = getRatingForBooking(booking.id);
    
    return (
      <View style={styles.bookingCard as any}>
        {/* Card Header with Status */}
        <View style={styles.cardHeader as any}>
          <View style={styles.cardHeaderLeft as any}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }] as any} />
            <View style={styles.headerTextContainer as any}>
              <Text style={styles.taskTitle}>{booking.task}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }] as any}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusText(booking.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.bookingDetails as any}>
          <View style={styles.detailRow as any}>
            <View style={styles.detailIconContainer as any}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent as any}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(booking.date)} at {formatTime(booking.date)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow as any}>
            <View style={styles.detailIconContainer as any}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent as any}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {booking.location.address}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow as any}>
            <View style={styles.detailIconContainer as any}>
              <Ionicons name="cash-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent as any}>
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={[styles.detailValue, styles.paymentAmount]}>
                PKR {booking.payment?.amount || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {booking.description && (
          <View style={styles.descriptionContainer as any}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{booking.description}</Text>
          </View>
        )}

        {/* Status-specific Content */}
        {booking.status === 'pending' && (
          <View style={styles.actionSection as any}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton] as any}
              onPress={() => handleDeclineBooking(booking.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.declineButtonText}>{t('myWork.decline')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton] as any}
              onPress={() => handleAcceptBooking(booking.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
              <Text style={styles.acceptButtonText}>{t('myWork.accept')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === 'accepted' && (
          <View style={[styles.statusMessage, { backgroundColor: colors.success + '10', borderLeftColor: colors.success }] as any}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <View style={styles.statusMessageContent as any}>
              <Text style={[styles.statusMessageText, { color: colors.success }]}>
                Booking Accepted
              </Text>
              <Text style={styles.statusMessageSubtext}>
                The employer has been notified. Please arrive on time.
              </Text>
            </View>
          </View>
        )}

        {booking.status === 'completed' && (
          <View style={styles.completedSection as any}>
            <View style={[styles.statusMessage, { backgroundColor: colors.primary + '10', borderLeftColor: colors.primary }] as any}>
              <Ionicons name="checkmark-done-circle" size={18} color={colors.primary} />
              <View style={styles.statusMessageContent as any}>
                <Text style={[styles.statusMessageText, { color: colors.primary }]}>
                  Job Completed
                </Text>
                <Text style={styles.statusMessageSubtext}>
                  Great work! This booking has been completed successfully.
                </Text>
              </View>
            </View>
            
            {rating ? (
              <View style={styles.ratingCard as any}>
                <View style={styles.ratingHeader as any}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={styles.ratingTitle}>Your Rating</Text>
                </View>
                <StarRating rating={rating.rating} size="sm" showText />
                {rating.review && (
                  <View style={styles.reviewContainer as any}>
                    <Text style={styles.reviewText}>"{rating.review}"</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noRatingContainer as any}>
                <Ionicons name="star-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.noRatingText}>No rating received yet</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState as any}>
      <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t('myWork.noBookings')}</Text>
      <Text style={styles.emptyDescription}>
        {selectedTab === 'pending' 
          ? 'No pending bookings at the moment'
          : selectedTab === 'accepted'
          ? 'No accepted bookings yet'
          : 'No completed bookings yet'
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
      activeOpacity={0.7}
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Colored Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>MY WORK</Text>
          <Text style={styles.headerSubtitle}>{t('common.viewAssignedWork')}</Text>
        </View>
      </View>

      {/* Tab Container */}
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          {renderTabButton('pending', t('myWork.pending'), pendingCount)}
          {renderTabButton('accepted', t('myWork.accepted'), acceptedCount)}
          {renderTabButton('completed', t('myWork.completed'), completedCount)}
        </View>
      </View>

      {/* Content */}
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
  // Tab Container
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500' as any,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: '600' as any,
  },
  // Content
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  // Booking Card
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  // Card Header
  cardHeader: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 4,
    borderRadius: 2,
    minHeight: 32,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700' as any,
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Booking Details
  bookingDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500' as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500' as any,
    lineHeight: 18,
  },
  paymentAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '700' as any,
    color: colors.primary,
  },
  // Description
  descriptionContainer: {
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  descriptionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    fontWeight: '500' as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 18,
  },
  // Action Section
  actionSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs / 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  declineButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  declineButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600' as any,
    color: colors.danger,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600' as any,
    color: colors.white,
  },
  // Status Message
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statusMessageContent: {
    flex: 1,
  },
  statusMessageText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600' as any,
    marginBottom: 2,
  },
  statusMessageSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  // Completed Section
  completedSection: {
    marginTop: spacing.sm,
  },
  // Rating Card
  ratingCard: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs,
  },
  ratingTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600' as any,
    color: colors.text,
  },
  reviewContainer: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  reviewText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  noRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs / 2,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.sm,
  },
  noRatingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    minHeight: 200,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600' as any,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
});
