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
import { setProfileEditMode, setDarkMode, setLanguage } from '../../store/slices/userSlice';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const { profileEditMode, preferences } = useAppSelector((state) => state.user);
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    address: user?.profile.address || '',
  });

  const handleSaveProfile = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert(t('common.error'), t('common.fillRequiredFields'));
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
      Alert.alert(t('common.success'), t('common.profileUpdated'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error || t('common.updateFailed'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      t('common.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
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

  const handleToggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    await changeLanguage(newLang);
    dispatch(setLanguage(newLang));
    
    // Just show a simple message, no layout changes
    Alert.alert(
      'Success',
      newLang === 'ur' 
        ? 'Language changed to Urdu' 
        : 'Language changed to English'
    );
  };

  const styles = getStyles(colors);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('common.userNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Header with Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(formData.firstName.charAt(0) + formData.lastName.charAt(0)).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>
            {formData.firstName} {formData.lastName}
          </Text>
          <Text style={styles.profileRole}>{t('common.employer')}</Text>

          {/* Action Buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleEditToggle}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={profileEditMode ? "close" : "create-outline"} 
                size={18} 
                color={colors.primary} 
              />
              <Text style={styles.actionButtonText}>
                {profileEditMode ? t('common.cancel') : t('common.edit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.actionButton, styles.logoutButton]}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
                {t('common.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.basicInfo')}</Text>
          
          <Input
            label={`${t('profile.firstName')} *`}
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            editable={profileEditMode}
            placeholder={t('common.enterFirstName')}
          />

          <Input
            label={`${t('profile.lastName')} *`}
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            editable={profileEditMode}
            placeholder={t('common.enterLastName')}
          />

          <Input
            label={t('profile.email')}
            value={user.email}
            editable={false}
            placeholder={t('common.emailCannotChange')}
            containerStyle={styles.disabledInput}
          />

          <Input
            label={t('profile.phone')}
            value={user.phoneNumber}
            editable={false}
            placeholder={t('common.phoneCannotChange')}
            containerStyle={styles.disabledInput}
          />

          <Input
            label={t('profile.address')}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            editable={profileEditMode}
            multiline
            numberOfLines={3}
            placeholder={t('common.enterAddress')}
          />
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.accountInfo')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.cnicNumber')}:</Text>
              <Text style={styles.infoValue}>{user.profile.cnic}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.verificationStatus')}:</Text>
              <Text style={[
                styles.infoValue,
                { color: user.profile.cnicVerified ? colors.success : colors.warning }
              ]}>
                {user.profile.cnicVerified ? t('common.verified') : t('common.pending')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.memberSince')}:</Text>
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
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>🔔 {t('profile.notifications')}</Text>
            <Text style={styles.settingValue}>{t('common.enabled')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleToggleDarkMode}>
            <Text style={styles.settingLabel}>🌙 {t('profile.darkMode')}</Text>
            <Text style={styles.settingValue}>{preferences.darkMode ? t('common.enabled') : t('common.disabled')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleToggleLanguage}>
            <Text style={styles.settingLabel}>🌐 {t('common.language')}</Text>
            <Text style={styles.settingValue}>
              {i18n.language === 'ur' ? 'اردو' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {profileEditMode && (
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? t('common.saving') : t('common.saveChanges')}
              onPress={handleSaveProfile}
              loading={isLoading}
              style={styles.saveButton}
            />
          </View>
        )}

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.help')}</Text>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>📞 {t('profile.contactSupport')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>❓ {t('profile.faq')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>📋 {t('profile.terms')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpLabel}>🔒 {t('profile.privacy')}</Text>
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
  // Profile Header
  profileHeader: {
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700' as any,
    color: colors.primary,
  },
  profileName: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700' as any,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  profileRole: {
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600' as any,
    color: colors.primary,
  },
  logoutButton: {
    backgroundColor: colors.white,
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