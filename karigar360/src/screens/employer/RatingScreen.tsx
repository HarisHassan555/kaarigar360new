import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { StarRating } from '../../components/common/StarRating';
import { useTheme } from '../../hooks/useTheme';
import { EmployerStackParamList } from '../../navigation/types';
import { submitRating } from '../../services/firebase/bookingService';
import { getWorkerById } from '../../services/firebase/workerService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { refreshUserData } from '../../store/slices/authSlice';
import { Booking, Rating } from '../../types';
import { shadows, spacing, typography } from '../../utils/theme';

type Props = NativeStackScreenProps<EmployerStackParamList, 'Rating'>;

export const RatingScreen = ({ route, navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { booking } = route.params;
  const { colors } = useTheme();

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [workerName, setWorkerName] = useState('Loading...');

  const styles = getStyles(colors);

  useEffect(() => {
    const fetchWorkerName = async () => {
      try {
        const worker = await getWorkerById(booking.workerId);
        setWorkerName(worker?.profile.fullName || 'Unknown Worker');
      } catch (error) {
        console.error('Error fetching worker:', error);
        setWorkerName('Unknown Worker');
      }
    };

    fetchWorkerName();
  }, [booking.workerId]);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a rating');
      return;
    }

    setLoading(true);

    try {
      const ratingData: Omit<Rating, 'createdAt'> = {
        bookingId: booking.id,
        workerId: booking.workerId,
        employerId: user.uid,
        rating,
        review: review.trim(),
      };

      await submitRating(ratingData);

      // Refresh user data to update worker's rating in Redux store
      dispatch(refreshUserData());

      Alert.alert(
        'Rating Submitted Successfully! ⭐',
        'Thank you for your feedback! Your rating helps other employers find quality workers.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = [
    '',
    'Very Poor',
    'Poor',
    'Average',
    'Good',
    'Excellent',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Info */}
        <View style={styles.bookingInfo}>
          <Text style={styles.taskTitle}>{booking.task}</Text>
          <Text style={styles.workerName}>Worker: {workerName}</Text>
          <Text style={styles.taskDate}>
            Completed on {new Date(booking.date).toLocaleDateString()}
          </Text>
          <Text style={styles.taskLocation}>📍 {booking.location.address}</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Payment:</Text>
            <Text style={styles.amountValue}>Hourly Rate Basis</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How was the work quality?</Text>
          <Text style={styles.sectionSubtitle}>
            Rate your experience with this worker
          </Text>

          <View style={styles.starContainer}>
            <StarRating
              rating={rating}
              size={40}
              interactive={true}
              onRatingChange={setRating}
            />
          </View>

          <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Write a Review (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Share your experience to help other employers
          </Text>

          <Input
            placeholder="Describe your experience with this worker..."
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            style={styles.reviewInput}
          />

          <View style={styles.reviewTips}>
            <Text style={styles.tipsTitle}>💡 Review Tips:</Text>
            <Text style={styles.tipText}>• Mention work quality and professionalism</Text>
            <Text style={styles.tipText}>• Was the worker punctual and reliable?</Text>
            <Text style={styles.tipText}>• Would you hire them again?</Text>
            <Text style={styles.tipText}>• Any specific skills they demonstrated well?</Text>
          </View>
        </View>

        {/* Rating Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Review Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Your Rating:</Text>
            <View style={styles.summaryRating}>
              <StarRating rating={rating} size={16} />
              <Text style={styles.summaryRatingText}>
                {rating}/5 - {ratingLabels[rating]}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Review Length:</Text>
            <Text style={styles.summaryValue}>
              {review.length} characters
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Worker:</Text>
            <Text style={styles.summaryValue}>
              {workerName}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Submitting Rating...' : 'Submit Rating & Finish'}
            onPress={handleSubmitRating}
            loading={loading}
            style={styles.submitButton}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  backText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  bookingInfo: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  taskTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  workerName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  taskDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  taskLocation: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.success,
  },
  ratingSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  starContainer: {
    marginBottom: spacing.md,
  },
  ratingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  reviewSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  reviewInput: {
    marginBottom: spacing.md,
  },
  reviewTips: {
    backgroundColor: colors.info + '20',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  tipsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  summarySection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRatingText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submitButton: {
    width: '100%',
  },
}); 