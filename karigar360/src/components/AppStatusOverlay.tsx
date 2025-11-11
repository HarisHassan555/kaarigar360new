import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing, typography } from '../utils/theme';

export const AppStatusOverlay: React.FC = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const trialEndDate = new Date('2025-11-18');
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  trialEndDate.setHours(0, 0, 0, 0);

  const isTrialExpired = currentDate > trialEndDate;

  if (!isTrialExpired) {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="none"
      hardwareAccelerated
      onRequestClose={() => {}} // Prevent closing on Android back button
      presentationStyle="fullScreen"
    >
      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.content} pointerEvents="auto">
          <Text style={styles.icon}>⛔</Text>
          <Text style={styles.title}>Free Trial Over</Text>
          <Text style={styles.message}>
            Your free trial period has ended. Please contact support to continue using the app.
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              For assistance, please reach out to our support team.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    width: '100%',
    marginTop: spacing.md,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

