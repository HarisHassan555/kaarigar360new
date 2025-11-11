import React, { useState, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { StarRating } from '../../components/common/StarRating';
import { getWorkerRatings } from '../../services/firebase/workerService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, logout, updateProfile } from '../../store/slices/authSlice';
import { setProfileEditMode, setDarkMode } from '../../store/slices/userSlice';
import { Rating } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography } from '../../utils/theme';

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const { profileEditMode, preferences } = useAppSelector((state) => state.user);
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    address: user?.profile.address || '',
  });
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    if (!user) return;

    try {
      setLoadingRatings(true);
      const workerRatings = await getWorkerRatings(user.uid);
      setRatings(workerRatings);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      dispatch(clearError());
      await dispatch(updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
      })).unwrap();
      
      dispatch(setProfileEditMode(false));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  const handleEditToggle = () => {
    if (profileEditMode) {
      // Reset form data when canceling
      setFormData({
        firstName: user?.profile.firstName || '',
        lastName: user?.profile.lastName || '',
        address: user?.profile.address || '',
      });
    }
    dispatch(setProfileEditMode(!profileEditMode));
  };

  const handleToggleDarkMode = () => {
    dispatch(setDarkMode(!preferences.darkMode));
  };

  const styles = getStyles(colors);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleEditToggle}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {profileEditMode ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicturePlaceholder}>
              <Text style={styles.profilePictureInitial}>
                {(formData.firstName.charAt(0) + formData.lastName.charAt(0)).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.fullName}>
            {formData.firstName} {formData.lastName}
          </Text>
          <Text style={styles.userRole}>Worker</Text>
          {user.profile.cnicVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ CNIC Verified</Text>
            </View>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="First Name *"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            editable={profileEditMode}
            placeholder="Enter your first name"
          />

          <Input
            label="Last Name *"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            editable={profileEditMode}
            placeholder="Enter your last name"
          />

          <Input
            label="Email Address"
            value={user.email}
            editable={false}
            placeholder="Email cannot be changed"
            containerStyle={styles.disabledInput}
          />

          <Input
            label="Phone Number"
            value={user.phoneNumber}
            editable={false}
            placeholder="Phone number cannot be changed"
            containerStyle={styles.disabledInput}
          />

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            editable={profileEditMode}
            multiline
            numberOfLines={3}
            placeholder="Enter your complete address"
          />
        </View>

        {/* Worker Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worker Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CNIC Number:</Text>
              <Text style={styles.infoValue}>{user.profile.cnic || 'Not provided'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Verification Status:</Text>
              <Text style={[
                styles.infoValue,
                { color: user.profile.cnicVerified ? colors.success : colors.warning }
              ]}>
                {user.profile.cnicVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Ratings & Reviews</Text>
          
          <View style={styles.ratingSummaryCard}>
            <View style={styles.ratingSummary}>
              <Text style={styles.ratingNumber}>
                {user.profile.rating ? user.profile.rating.toFixed(1) : '0.0'}
              </Text>
              <View style={styles.ratingDetails}>
                <StarRating 
                  rating={user.profile.rating || 0} 
                  size="lg" 
                  showText={false}
                />
                <Text style={styles.ratingCount}>
                  {ratings.length} review{ratings.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {loadingRatings ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : ratings.length > 0 ? (
            <View style={styles.reviewsList}>
              {ratings.slice(0, 3).map((rating, index) => (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <StarRating rating={rating.rating} size="sm" showText={false} />
                    <Text style={styles.reviewDate}>
                      {rating.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  {rating.review && (
                    <Text style={styles.reviewText}>"{rating.review}"</Text>
                  )}
                </View>
              ))}
              {ratings.length > 3 && (
                <Text style={styles.moreReviewsText}>
                  +{ratings.length - 3} more review{ratings.length - 3 !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>
                Complete your first job to start receiving reviews!
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {profileEditMode && (
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Saving...' : 'Save Changes'}
              onPress={handleSaveProfile}
              loading={isLoading}
              style={styles.saveButton}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionLabel}>📋 My Bookings</Text>
            <Text style={styles.quickActionSubtext}>View your assigned work</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionLabel}>⭐ Reviews</Text>
            <Text style={styles.quickActionSubtext}>View customer feedback</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleToggleDarkMode}>
            <Text style={styles.settingLabel}>🌙 Dark Mode</Text>
            <Text style={styles.settingValue}>{preferences.darkMode ? 'Enabled' : 'Disabled'}</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>📞 Contact Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>❓ FAQ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>📋 Terms & Conditions</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Kaarigar360 Worker v1.0.0</Text>
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
    paddingBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  profilePicturePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  profilePictureInitial: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.white,
  },
  fullName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userRole: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  verifiedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  disabledInput: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  quickActionItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickActionLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  quickActionSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  settingValue: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  helpItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  helpLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  versionContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  versionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  ratingSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.lg,
  },
  ratingDetails: {
    flex: 1,
  },
  ratingCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  reviewsList: {
    gap: spacing.sm,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  reviewText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontStyle: 'italic',
  },
  moreReviewsText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  noReviewsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  noReviewsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 