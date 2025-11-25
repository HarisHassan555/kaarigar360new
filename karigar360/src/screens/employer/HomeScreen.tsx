import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store/hooks';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography, borderRadius } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type Props = {
  navigation: BottomTabNavigationProp<any>;
};

export const HomeScreen = ({ navigation }: Props) => {
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.goodMorning');
    if (hour < 17) return t('home.goodAfternoon');
    return t('home.goodEvening');
  };

  const quickActions = [
    {
      title: t('home.findWorkers'),
      description: t('home.searchWorkers'),
      icon: 'search-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('SearchTab'),
    },
    {
      title: t('home.myBookings'),
      description: t('home.viewManageBookings'),
      icon: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('BookingsTab'),
    },
    {
      title: t('profile.title'),
      description: 'Manage your profile and settings',
      icon: 'settings-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('ProfileTab'),
    },
  ];

  const features = [
    {
      title: 'Quick Search',
      value: 'Find skilled workers instantly',
      icon: 'search' as keyof typeof Ionicons.glyphMap,
    },
    {
      title: 'Easy Booking',
      value: 'Book workers with just a few taps',
      icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
    },
    {
      title: 'Track Progress',
      value: 'Monitor your bookings in real-time',
      icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
    },
  ];

  const menuItems = [
    {
      title: 'Lorem ipsum',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {},
    },
    {
      title: 'Dolor sit',
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      badge: 1,
      onPress: () => {},
    },
    {
      title: 'Amet lorem',
      icon: 'key-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {},
    },
    {
      title: 'Ipsum dolor',
      icon: 'settings-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {},
    },
  ];

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Colored Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>EMPLOYER DASHBOARD</Text>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.nameText}>{user?.profile.fullName || t('common.userNotFound')}</Text>
            <Text style={styles.subtitleText}>Ready to find the perfect worker for your needs?</Text>
          </View>
        </View>
        {/* Quick Actions - List Style */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>{t('common.quickActions')}</Text>
          <View style={styles.menuCard}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < quickActions.length - 1 && styles.menuItemBorder
                ]}
                onPress={action.onPress}
                activeOpacity={0.6}
              >
                <Ionicons name={action.icon} size={22} color={colors.text} />
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{action.title}</Text>
                  <Text style={styles.menuItemDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features Cards */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>Why Choose Kaarigar360?</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Ionicons name={feature.icon} size={24} color={colors.primary} />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionLabel}>{t('home.recentActivity')}</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{t('home.noRecentActivity')}</Text>
                <Text style={styles.activitySubtext}>
                  {t('home.startFinding')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('SearchTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Find Workers Now</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: spacing.xs }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder
                ]}
                onPress={item.onPress}
                activeOpacity={0.6}
              >
                <Ionicons name={item.icon} size={22} color={colors.text} />
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
  // Colored Header Section
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
    fontWeight: typography.weights.bold,
    color: colors.white,
    opacity: 0.8,
    letterSpacing: 2,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  greetingText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs / 2,
  },
  nameText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.85,
    lineHeight: 22,
  },
  // Content
  content: {
    paddingBottom: spacing.xl,
  },
  // Sections
  actionsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  featuresSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  activitySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Menu Card
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuItemTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  menuItemDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Activity Card
  activityCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  activityContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  activityText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  activitySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  // Badge
  badge: {
    backgroundColor: colors.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
