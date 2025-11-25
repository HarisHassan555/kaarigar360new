import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { getCurrentUserData } from '../../services/firebase/authService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { colors, shadows, spacing, typography } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

export const StatusCheckScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserStatus(user.status);
    }
  }, [user]);

  const checkStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userData = await getCurrentUserData(user);
      setUserStatus(userData?.status || 'unknown');
      
      if (userData?.status === 'approved') {
        Alert.alert(
          t('statusCheck.title'),
          'Your account has been approved. You can now access the app.',
          [
            {
              text: t('common.save'),
              onPress: () => {
                // This will trigger the auth state change and redirect to main app
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert(t('common.error'), 'Failed to check account status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    Alert.alert(
      t('common.logout'),
      'To go back to the login screen, you need to sign out of your current account. Do you want to continue?',
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

  const getStatusInfo = () => {
    switch (userStatus) {
      case 'pending':
        return {
          title: 'Account Pending Approval',
          message: 'Your account is currently under review by our admin team. This process usually takes 24-48 hours.',
          icon: '⏳',
          color: colors.warning,
          showCheckButton: true,
        };
      case 'rejected':
        return {
          title: 'Account Rejected',
          message: 'Your account has been rejected. Please contact support for more information about the reason for rejection.',
          icon: '❌',
          color: colors.danger,
          showCheckButton: false,
        };
      case 'suspended':
        return {
          title: 'Account Suspended',
          message: 'Your account has been suspended. Please contact support for more information.',
          icon: '🚫',
          color: colors.danger,
          showCheckButton: false,
        };
      default:
        return {
          title: 'Account Status Unknown',
          message: 'Unable to determine your account status. Please contact support.',
          icon: '❓',
          color: colors.gray[600],
          showCheckButton: true,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{statusInfo.icon}</Text>
          <Text style={styles.title}>{statusInfo.title}</Text>
          <Text style={styles.subtitle}>Account Status Check</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusIcon, { color: statusInfo.color }]}>
              {statusInfo.icon}
            </Text>
          </View>
          
          <Text style={styles.statusTitle}>Current Status: {userStatus?.toUpperCase() || 'UNKNOWN'}</Text>
          <Text style={styles.statusMessage}>{statusInfo.message}</Text>
        </View>

        {userStatus === 'pending' && (
          <View style={styles.pendingInfo}>
            <Text style={styles.pendingTitle}>What happens next?</Text>
            <View style={styles.pendingSteps}>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Admin reviews your profile and documents</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>CNIC verification is completed</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>You receive approval notification</Text>
              </View>
            </View>
          </View>
        )}

        {userStatus === 'rejected' && (
          <View style={styles.rejectedInfo}>
            <Text style={styles.rejectedTitle}>Why was my account rejected?</Text>
            <Text style={styles.rejectedText}>
              Common reasons include:
              {'\n'}• Invalid or unclear CNIC photos
              {'\n'}• Incomplete profile information
              {'\n'}• Duplicate account registration
              {'\n'}• Violation of terms and conditions
            </Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          {statusInfo.showCheckButton && (
            <Button
              title={loading ? 'Checking...' : 'Check Status'}
              onPress={checkStatus}
              loading={loading}
              style={styles.checkButton}
            />
          )}
          
          <Button
            title="Go to Login"
            onPress={handleGoToLogin}
            variant="outline"
            style={styles.loginButton}
          />
          
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Contact our support team at support@kaarigar360.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statusIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIcon: {
    fontSize: 32,
  },
  statusTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  statusMessage: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  pendingInfo: {
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  pendingTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  pendingSteps: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.gray[700],
  },
  rejectedInfo: {
    backgroundColor: colors.danger + '10',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  rejectedTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  rejectedText: {
    fontSize: typography.sizes.md,
    color: colors.gray[700],
    lineHeight: 22,
  },
  actionContainer: {
    gap: spacing.md,
  },
  checkButton: {
    marginBottom: spacing.sm,
  },
  loginButton: {
    marginBottom: spacing.sm,
  },
  supportButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
