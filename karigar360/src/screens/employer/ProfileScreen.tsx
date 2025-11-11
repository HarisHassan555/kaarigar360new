import React, { useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, logout, updateProfile } from '../../store/slices/authSlice';
import { setProfileEditMode, setDarkMode } from '../../store/slices/userSlice';
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
              style={[styles.actionButton, styles.editButton]}
            >
              <Text style={[styles.actionButtonText, styles.editButtonText]}>
                {profileEditMode ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.actionButton, styles.logoutButton]}
            >
              <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
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
          <Text style={styles.userRole}>
            {user.role === 'employer' ? 'Employer' : 'Worker'}
          </Text>
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

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CNIC Number:</Text>
              <Text style={styles.infoValue}>{user.profile.cnic}</Text>
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

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>🔔 Notifications</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleToggleDarkMode}>
            <Text style={styles.settingLabel}>🌙 Dark Mode</Text>
            <Text style={styles.settingValue}>{preferences.darkMode ? 'Enabled' : 'Disabled'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>🌐 Language</Text>
            <Text style={styles.settingValue}>English</Text>
          </TouchableOpacity>
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
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>🔒 Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Kaarigar360 v1.0.0</Text>
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
    color: colors.gray[600],
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
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  editButtonText: {
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: colors.white,
    borderColor: colors.danger,
  },
  logoutButtonText: {
    color: colors.danger,
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
  buttonContainer: {
    padding: spacing.lg,
  },
  saveButton: {
    marginBottom: spacing.md,
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
}); 