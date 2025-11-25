import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, login } from '../../store/slices/authSlice';
import { colors, spacing, typography } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.enterBothFields'));
      return;
    }

    try {
      dispatch(clearError());
      await dispatch(login({
        email: email.toLowerCase().trim(),
        password
      })).unwrap();
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert(t('auth.loginFailed'), error.message || t('auth.invalidCredentials'));
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.signInAccount')}
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label={t('auth.emailAddress')}
                placeholder={t('auth.enterEmail')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Input
                label={t('auth.password')}
                placeholder={t('auth.enterPassword')}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Button
                title={isLoading ? t('auth.signingIn') : t('auth.signIn')}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.registerSection}>
              <Text style={styles.registerText}>{t('auth.noAccount')} </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.registerLink}>{t('auth.createAccount')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>{t('auth.whyKaarigar360')}</Text>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>{t('auth.verifiedWorkers')}</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>💰</Text>
                <Text style={styles.featureText}>{t('auth.transparentPricing')}</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🛡️</Text>
                <Text style={styles.featureText}>{t('auth.securePayments')}</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>⭐</Text>
                <Text style={styles.featureText}>{t('auth.ratedProfessionals')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.lg,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  registerText: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
  },
  registerLink: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
  },
  featuresSection: {
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.dark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: typography.sizes.md,
    marginRight: spacing.sm,
  },
  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
  },
}); 