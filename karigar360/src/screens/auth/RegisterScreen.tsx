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
import { ImagePicker } from '../../components/common/ImagePicker';
import { Input } from '../../components/common/Input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, register } from '../../store/slices/authSlice';
import { RegistrationData, User } from '../../types';
import { colors, spacing, typography } from '../../utils/theme';
import { uploadCNICPhotos } from '../../services/firebase/storageService';
import { updateUserCNICPhotos } from '../../services/firebase/userService';
import { AuthStackParamList } from '../../navigation/types';

type RegistrationStep = 1 | 2 | 3 | 4 | 5;
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    address: '',
    cnic: '',
    cnicFrontPhoto: '',
    cnicBackPhoto: '',
    role: 'employer',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const updateRegistrationData = (field: keyof RegistrationData, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: RegistrationStep): boolean => {
    switch (step) {
      case 1:
        return !!(registrationData.firstName.trim() && registrationData.lastName.trim());
      case 2:
        return !!(
          registrationData.phoneNumber.trim() &&
          registrationData.address.trim()
        );
      case 3:
        return !!(
          registrationData.email.trim() &&
          registrationData.password.length >= 6 &&
          confirmPassword === registrationData.password
        );
      case 4:
        return !!(registrationData.cnic.trim());
      case 5:
        return !!(registrationData.cnicFrontPhoto && registrationData.cnicBackPhoto);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as RegistrationStep);
      } else {
        handleRegistration();
      }
    } else {
      showValidationError();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegistrationStep);
    }
  };

  const showValidationError = () => {
    switch (currentStep) {
      case 1:
        Alert.alert('Validation Error', 'Please fill in your first and last name');
        break;
      case 2:
        Alert.alert('Validation Error', 'Please fill in your phone number and address');
        break;
      case 3:
        if (!registrationData.email.trim()) {
          Alert.alert('Validation Error', 'Please enter your email address');
        } else if (registrationData.password.length < 6) {
          Alert.alert('Validation Error', 'Password must be at least 6 characters');
        } else if (confirmPassword !== registrationData.password) {
          Alert.alert('Validation Error', 'Passwords do not match');
        }
        break;
      case 4:
        Alert.alert('Validation Error', 'Please enter your CNIC number');
        break;
      case 5:
        Alert.alert('Validation Error', 'Please upload both front and back photos of your CNIC');
        break;
    }
  };

  const handleRegistration = async () => {
    try {
      dispatch(clearError());
      
      // First, create the user account to get the user ID
      const tempUserData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'> = {
        email: registrationData.email.toLowerCase().trim(),
        phoneNumber: registrationData.phoneNumber.trim(),
        role: registrationData.role,
        status: 'pending', // Set to pending for admin approval
        profile: {
          firstName: registrationData.firstName.trim(),
          lastName: registrationData.lastName.trim(),
          fullName: `${registrationData.firstName.trim()} ${registrationData.lastName.trim()}`,
          address: registrationData.address.trim(),
          cnic: registrationData.cnic.trim(),
          cnicVerified: false, // Set to false initially, will be verified later
        }
      };
      
      // Create user account first to get user ID
      const userResult = await dispatch(register({
        email: registrationData.email.toLowerCase().trim(),
        password: registrationData.password,
        userData: tempUserData
      })).unwrap();
      
      // Now upload CNIC photos to Firebase Storage using the user ID
      let cnicPhotos = null;
      if (registrationData.cnicFrontPhoto && registrationData.cnicBackPhoto) {
        console.log('📸 Uploading CNIC photos to Firebase Storage...');
        console.log('📷 Front photo URI:', registrationData.cnicFrontPhoto);
        console.log('📷 Back photo URI:', registrationData.cnicBackPhoto);
        console.log('👤 User ID for upload:', userResult.uid);
        
        try {
          cnicPhotos = await uploadCNICPhotos(
            userResult.uid,
            registrationData.cnicFrontPhoto,
            registrationData.cnicBackPhoto
          );
          console.log('✅ CNIC photos uploaded successfully');
          console.log('🔗 Front photo URL:', cnicPhotos.front);
          console.log('🔗 Back photo URL:', cnicPhotos.back);
        } catch (uploadError: any) {
          console.error('❌ Failed to upload CNIC photos:', uploadError);
          console.error('❌ Upload error details:', uploadError.message);
          Alert.alert(
            'Upload Warning', 
            `Your account was created but CNIC photos failed to upload: ${uploadError.message}. You can update them later in your profile.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('⚠️ No CNIC photos to upload');
      }
      
      // Update user document with CNIC photos URLs if upload was successful
      if (cnicPhotos) {
        try {
          await updateUserCNICPhotos(userResult.uid, cnicPhotos);
          console.log('✅ User document updated with CNIC photos URLs');
        } catch (updateError: any) {
          console.error('❌ Failed to update user document with CNIC photos:', updateError);
          Alert.alert(
            'Update Warning', 
            'Your account was created and photos uploaded, but there was an issue updating your profile. Please contact support.',
            [{ text: 'OK' }]
          );
        }
      }
      
      Alert.alert(
        'Registration Successful!', 
        'Your account has been created successfully. Your registration is now pending admin approval. You will receive a notification once your account is approved and you can access the app.',
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login'),
          },
          {
            text: 'Stay Here',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error || 'Registration failed');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View
          key={step}
          style={[
            styles.progressStep,
            step <= currentStep && styles.activeProgressStep,
            step === currentStep && styles.currentProgressStep,
          ]}
        >
          <Text
            style={[
              styles.progressStepText,
              step <= currentStep && styles.activeProgressStepText,
            ]}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Let&apos;s start with your basic details</Text>
      
      <Input
        label="First Name *"
        placeholder="Enter your first name"
        value={registrationData.firstName}
        onChangeText={(text) => updateRegistrationData('firstName', text)}
        autoCapitalize="words"
      />
      
      <Input
        label="Last Name *"
        placeholder="Enter your last name"
        value={registrationData.lastName}
        onChangeText={(text) => updateRegistrationData('lastName', text)}
        autoCapitalize="words"
      />

      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>I am registering as:</Text>
        <View style={styles.roleButtons}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              registrationData.role === 'employer' && styles.activeRoleButton,
            ]}
            onPress={() => updateRegistrationData('role', 'employer')}
          >
            <Text
              style={[
                styles.roleButtonText,
                registrationData.role === 'employer' && styles.activeRoleButtonText,
              ]}
            >
              👔 Employer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              registrationData.role === 'worker' && styles.activeRoleButton,
            ]}
            onPress={() => updateRegistrationData('role', 'worker')}
          >
            <Text
              style={[
                styles.roleButtonText,
                registrationData.role === 'worker' && styles.activeRoleButtonText,
              ]}
            >
              🔧 Worker
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Contact Information</Text>
      <Text style={styles.stepSubtitle}>How can we reach you?</Text>
      
      <Input
        label="Phone Number *"
        placeholder="+92 300 1234567"
        value={registrationData.phoneNumber}
        onChangeText={(text) => updateRegistrationData('phoneNumber', text)}
        keyboardType="phone-pad"
      />
      
      <Input
        label="Address *"
        placeholder="Enter your complete address"
        value={registrationData.address}
        onChangeText={(text) => updateRegistrationData('address', text)}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Account Security</Text>
      <Text style={styles.stepSubtitle}>Create your account credentials</Text>
      
      <Input
        label="Email Address *"
        placeholder="enter@example.com"
        value={registrationData.email}
        onChangeText={(text) => updateRegistrationData('email', text.toLowerCase())}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        label="Password *"
        placeholder="At least 6 characters"
        value={registrationData.password}
        onChangeText={(text) => updateRegistrationData('password', text)}
        secureTextEntry
      />
      
      <Input
        label="Confirm Password *"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Identity Information</Text>
      <Text style={styles.stepSubtitle}>Enter your CNIC number for verification</Text>
      
      <Input
        label="CNIC Number *"
        placeholder="12345-1234567-8"
        value={registrationData.cnic}
        onChangeText={(text) => updateRegistrationData('cnic', text)}
        keyboardType="default"
      />

      <View style={styles.verificationNote}>
        <Text style={styles.verificationNoteText}>
          📝 Your CNIC will be verified within 24 hours. You can use the app while verification is pending.
        </Text>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Identity Verification</Text>
      <Text style={styles.stepSubtitle}>Upload clear photos of your CNIC</Text>
      
      <ImagePicker
        title="CNIC Front Side *"
        imageUri={registrationData.cnicFrontPhoto}
        onImageSelected={(uri) => updateRegistrationData('cnicFrontPhoto', uri)}
        placeholder="Upload front side of CNIC"
      />
      
      <ImagePicker
        title="CNIC Back Side *"
        imageUri={registrationData.cnicBackPhoto}
        onImageSelected={(uri) => updateRegistrationData('cnicBackPhoto', uri)}
        placeholder="Upload back side of CNIC"
      />

      <View style={styles.verificationNote}>
        <Text style={styles.verificationNoteText}>
          📝 Your CNIC will be verified within 24 hours. You can use the app while verification is pending.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
        </View>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Content */}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <Button
              title="Previous"
              onPress={prevStep}
              variant="outline"
              style={styles.prevButton}
            />
          )}
          <Button
            title={currentStep === 5 ? (isLoading ? 'Registering...' : 'Complete Registration') : 'Next'}
            onPress={nextStep}
            loading={isLoading}
            disabled={!validateStep(currentStep)}
            style={styles.nextButton}
          />
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.dark,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  activeProgressStep: {
    backgroundColor: colors.primary,
  },
  currentProgressStep: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  progressStepText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold as any,
    color: colors.white,
  },
  activeProgressStepText: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  stepContainer: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  roleContainer: {
    marginTop: spacing.md,
  },
  roleLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  activeRoleButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  roleButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.gray[600],
  },
  activeRoleButtonText: {
    color: colors.primary,
  },
  verificationNote: {
    backgroundColor: colors.info + '10',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  verificationNoteText: {
    fontSize: typography.sizes.sm,
    color: colors.info,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  prevButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  loginText: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
  },
  loginLink: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
  },
}); 