import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { EmployerStackParamList } from '../../navigation/types';
import { getWorkerById, getWorkerRatings } from '../../services/firebase/workerService';
import { Rating, Worker } from '../../types';
import { shadows, spacing, typography } from '../../utils/theme';

type Props = NativeStackScreenProps<EmployerStackParamList, 'WorkerProfile'>;

export const WorkerProfileScreen = ({ route, navigation }: Props) => {
  const { workerId } = route.params;
  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  
  const styles = getStyles(colors);

  useEffect(() => {
    loadWorkerData();
  }, [workerId]);

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      const [workerData, ratingsData] = await Promise.all([
        getWorkerById(workerId),
        getWorkerRatings(workerId)
      ]);
      
      setWorker(workerData);
      setReviews(ratingsData);
    } catch (error) {
      console.error('Error loading worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookWorker = () => {
    if (worker) {
      navigation.navigate('Booking', { worker });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading worker profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!worker || !worker.profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Worker not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{worker.profile?.fullName}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {(worker.profile?.rating || 0).toFixed(1)}</Text>
              <Text style={styles.experience}>
                {worker.profile?.experienceYears || 0} years experience
              </Text>
            </View>
            {worker.profile?.cnicVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ CNIC Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>PKR {worker.profile?.hourlyRate || 0}</Text>
            <Text style={styles.priceLabel}>per hour</Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {worker.profile.skills?.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{worker.profile?.description}</Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.length > 0 ? (
            reviews?.slice(0, 3).map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>Anonymous User</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.reviewRating}>
                    {'⭐'.repeat(review.rating)}
                  </Text>
                </View>
                <Text style={styles.reviewText}>{review.review}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
          {reviews.length > 3 && (
            <Text style={styles.moreReviews}>
              +{reviews.length - 3} more reviews
            </Text>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>{worker.phoneNumber}</Text>
          </View>
          <View style={styles.contactCard}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{worker.email}</Text>
          </View>
          <View style={styles.contactCard}>
            <Text style={styles.contactLabel}>Address</Text>
            <Text style={styles.contactValue}>{worker.profile?.address}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bookingSection}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookWorker}
          activeOpacity={0.7}
        >
          <Text style={styles.bookButtonText}>Book This Worker</Text>
        </TouchableOpacity>
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
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 120,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for booking button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    fontSize: typography.sizes.md,
    color: colors.warning,
    marginRight: spacing.sm,
  },
  experience: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  skillText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  reviewDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  reviewRating: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
  },
  reviewText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noReviews: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  moreReviews: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  contactValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500',
  },
  bookingSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
    zIndex: 1000,
    elevation: 5,
  },
  bookButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
}); 