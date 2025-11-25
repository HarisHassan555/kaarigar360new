import React, { useState, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { StarRating } from '../../components/common/StarRating';
import { getWorkerRatings } from '../../services/firebase/workerService';
import { addGlobalSkill } from '../../services/firebase/skillsService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, logout, updateProfile } from '../../store/slices/authSlice';
import { setProfileEditMode, setDarkMode, setLanguage } from '../../store/slices/userSlice';
import { Rating, WORKER_SKILLS } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography, borderRadius } from '../../utils/theme';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';

const { width } = Dimensions.get('window');

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
    hourlyRate: (user?.profile as any)?.hourlyRate?.toString() || '',
    skills: (user?.profile as any)?.skills || [] as string[],
    description: (user?.profile as any)?.description || '',
  });
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');

  useEffect(() => {
    loadRatings();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        address: user.profile.address || '',
        hourlyRate: (user.profile as any)?.hourlyRate?.toString() || '',
        skills: (user.profile as any)?.skills || [],
        description: (user.profile as any)?.description || '',
      });
    }
  }, [user]);

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
      Alert.alert(t('common.error'), t('common.fillRequiredFields'));
      return;
    }

    if (formData.hourlyRate && (isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) < 0)) {
      Alert.alert(t('common.error'), t('common.invalidHourlyRate'));
      return;
    }

    try {
      dispatch(clearError());
      await dispatch(updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        skills: formData.skills,
        description: formData.description.trim(),
      } as any)).unwrap();
      
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
      setFormData({
        firstName: user?.profile.firstName || '',
        lastName: user?.profile.lastName || '',
        address: user?.profile.address || '',
        hourlyRate: (user?.profile as any)?.hourlyRate?.toString() || '',
        skills: (user?.profile as any)?.skills || [],
        description: (user?.profile as any)?.description || '',
      });
    }
    dispatch(setProfileEditMode(!profileEditMode));
  };

  const toggleSkill = (skill: string) => {
    if (!profileEditMode) return;
    
    setFormData(prev => {
      const currentSkills = prev.skills || [];
      if (currentSkills.includes(skill)) {
        return {
          ...prev,
          skills: currentSkills.filter((s: string) => s !== skill),
        };
      } else {
        return {
          ...prev,
          skills: [...currentSkills, skill],
        };
      }
    });
  };

  const handleAddCustomSkill = async () => {
    if (!newSkillText.trim()) {
      Alert.alert('Error', 'Please enter a skill name');
      return;
    }

    const skillName = newSkillText.trim();
    const allSkills = [...WORKER_SKILLS, ...formData.skills];
    const skillExists = allSkills.some(
      skill => skill.toLowerCase() === skillName.toLowerCase()
    );

    if (skillExists) {
      Alert.alert('Error', 'This skill already exists');
      setNewSkillText('');
      return;
    }

    try {
      await addGlobalSkill(skillName);
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillName],
      }));
      setNewSkillText('');
      setShowAddSkill(false);
      Alert.alert('Success', 'New skill added and will be available for others to search!');
    } catch (error: any) {
      console.error('Error adding skill:', error);
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillName],
      }));
      setNewSkillText('');
      setShowAddSkill(false);
      Alert.alert('Warning', 'Skill added to your profile, but there was an issue adding it to the global list.');
    }
  };

  const getAllAvailableSkills = () => {
    const customSkills = formData.skills.filter(
      (skill: string) => !WORKER_SKILLS.includes(skill as any)
    );
    return [...WORKER_SKILLS, ...customSkills];
  };

  const handleToggleDarkMode = () => {
    dispatch(setDarkMode(!preferences.darkMode));
  };

  const handleToggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    await changeLanguage(newLang);
    dispatch(setLanguage(newLang));
    Alert.alert(
      'Success',
      newLang === 'ur' 
        ? 'Language changed to Urdu' 
        : 'Language changed to English'
    );
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const styles = getStyles(colors);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
            {user.profile.cnicVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>
            {formData.firstName} {formData.lastName}
          </Text>
          <Text style={styles.profileRole}>{t('common.worker')}</Text>
          
          {/* Rating Display */}
          {ratings.length > 0 && (
            <View style={styles.ratingDisplay}>
              <StarRating rating={averageRating} size="sm" showText />
              <Text style={styles.ratingCount}>({ratings.length} {t('profile.reviews')})</Text>
            </View>
          )}

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

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{formData.skills.length}</Text>
            <Text style={styles.statLabel}>{t('profile.skills')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={24} color={colors.warning} />
            <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{t('profile.rating')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.success} />
            <Text style={styles.statNumber}>{ratings.length}</Text>
            <Text style={styles.statLabel}>{t('profile.reviews')}</Text>
          </View>
        </View>

        {/* Basic Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('profile.basicInfo')}</Text>
          </View>
          
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

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.email')}</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.phone')}</Text>
              <Text style={styles.infoValue}>{user.phoneNumber || t('common.notProvided')}</Text>
            </View>
          </View>

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

        {/* Work Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('profile.workInfo')}</Text>
          </View>
          
          {profileEditMode ? (
            <Input
              label={t('profile.hourlyRate')}
              value={formData.hourlyRate}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setFormData({ ...formData, hourlyRate: numericValue });
              }}
              keyboardType="numeric"
              placeholder={t('profile.enterHourlyRate')}
            />
          ) : (
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.hourlyRate')}</Text>
                <Text style={styles.infoValue}>
                  {formData.hourlyRate ? `PKR ${formData.hourlyRate}/hr` : t('common.notProvided')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Skills Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('profile.skills')}</Text>
          </View>
          
          {profileEditMode ? (
            <View style={styles.skillsEditContainer}>
              <Text style={styles.skillsHint}>{t('common.selectSkills')}</Text>
              <View style={styles.skillsGrid}>
                {getAllAvailableSkills().map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillChip,
                        isSelected && styles.skillChipSelected,
                      ]}
                      onPress={() => toggleSkill(skill)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.skillChipText,
                          isSelected && styles.skillChipTextSelected,
                        ]}
                      >
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {!showAddSkill ? (
                <TouchableOpacity
                  style={styles.addSkillButton}
                  onPress={() => setShowAddSkill(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.addSkillButtonText}>{t('common.addNewSkill')}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.addSkillInputContainer}>
                  <TextInput
                    style={styles.addSkillInput}
                    placeholder={t('common.enterSkillName')}
                    placeholderTextColor={colors.textSecondary}
                    value={newSkillText}
                    onChangeText={setNewSkillText}
                    autoFocus
                    onSubmitEditing={handleAddCustomSkill}
                  />
                  <View style={styles.addSkillActions}>
                    <TouchableOpacity
                      style={styles.addSkillConfirmButton}
                      onPress={handleAddCustomSkill}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addSkillCancelButton}
                      onPress={() => {
                        setShowAddSkill(false);
                        setNewSkillText('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.skillsDisplay}>
              {formData.skills.length > 0 ? (
                <View style={styles.skillsGrid}>
                  {formData.skills.map((skill: string) => (
                    <View key={skill} style={styles.skillChipDisplay}>
                      <Text style={styles.skillChipTextDisplay}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noSkillsText}>{t('common.noSkills')}</Text>
              )}
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('profile.about')}</Text>
          </View>
          
          {profileEditMode ? (
            <Input
              label={t('profile.description')}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              placeholder={t('profile.enterDescription')}
            />
          ) : (
            <Text style={styles.descriptionText}>
              {formData.description || t('common.noDescription')}
            </Text>
          )}
        </View>

        {/* Ratings Section */}
        {ratings.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="star-outline" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>{t('profile.ratings')}</Text>
            </View>
            
            <View style={styles.ratingsList}>
              {ratings.slice(0, 5).map((rating, index) => (
                <View key={`${rating.bookingId}-${index}`} style={styles.ratingItem}>
                  <View style={styles.ratingHeader}>
                    <View style={styles.ratingInfo}>
                      <Text style={styles.ratingName}>Employer</Text>
                      <StarRating rating={rating.rating} size="sm" />
                    </View>
                    <Text style={styles.ratingDate}>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {rating.review && (
                    <Text style={styles.ratingReview}>"{rating.review}"</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('profile.settings')}</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleToggleDarkMode} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={colors.text} />
              <Text style={styles.settingLabel}>{t('profile.darkMode')}</Text>
            </View>
            <View style={[styles.toggle, preferences.darkMode && styles.toggleActive]}>
              <View style={[styles.toggleThumb, preferences.darkMode && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleToggleLanguage} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={colors.text} />
              <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            </View>
            <Text style={styles.settingValue}>{i18n.language.toUpperCase()}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {profileEditMode && (
          <View style={styles.saveButtonContainer}>
            <Button
              title={isLoading ? t('common.saving') : t('common.saveChanges')}
              onPress={handleSaveProfile}
              loading={isLoading}
            />
          </View>
        )}
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
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  profileName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  profileRole: {
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  ratingCount: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
  },
  logoutButton: {
    backgroundColor: colors.white + '20',
    borderWidth: 1,
    borderColor: colors.white,
  },
  logoutButtonText: {
    color: colors.white,
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
    marginTop: -spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Card Styles
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    fontWeight: typography.weights.medium as any,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium as any,
  },
  // Skills
  skillsEditContainer: {
    marginTop: spacing.sm,
  },
  skillsHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  skillChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium as any,
  },
  skillChipTextSelected: {
    color: colors.white,
  },
  skillChipDisplay: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  skillChipTextDisplay: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
  },
  skillsDisplay: {
    marginTop: spacing.sm,
  },
  noSkillsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  addSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addSkillButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold as any,
  },
  addSkillInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  addSkillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  addSkillActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  addSkillConfirmButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSkillCancelButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Description
  descriptionText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  // Ratings
  ratingsList: {
    marginTop: spacing.sm,
  },
  ratingItem: {
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  ratingDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  ratingReview: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  // Settings
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium as any,
  },
  settingValue: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  // Save Button
  saveButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  disabledInput: {
    opacity: 0.6,
  },
});
