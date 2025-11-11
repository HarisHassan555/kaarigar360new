import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { processPayment } from '../../services/firebase/bookingService';
import { Booking } from '../../types';
import { colors, spacing, typography } from '../../utils/theme';

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile' | 'bank';
  name: string;
  icon: string;
  details?: string;
}

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const route = useRoute();
  const { booking } = route.params as { booking: Booking };

  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    mobileNumber: '',
    bankAccount: '',
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      details: 'Visa, Mastercard, Unionpay',
    },
    {
      id: 'easypaisa',
      type: 'mobile',
      name: 'Easypaisa',
      icon: '📱',
      details: 'Mobile wallet payment',
    },
    {
      id: 'jazzcash',
      type: 'mobile',
      name: 'JazzCash',
      icon: '💰',
      details: 'Mobile wallet payment',
    },
    {
      id: 'bank',
      type: 'bank',
      name: 'Bank Transfer',
      icon: '🏦',
      details: 'Direct bank transfer',
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    // Basic validation based on payment method
    if (selectedMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    } else if (selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash') {
      if (!paymentDetails.mobileNumber) {
        Alert.alert('Error', 'Please enter your mobile number');
        return;
      }
    }

    setLoading(true);

    try {
      const success = await processPayment(booking.id, selectedMethod);

      if (success) {
        Alert.alert(
          'Payment Successful! 🎉',
          `Payment has been processed successfully. The worker will be notified and you can now rate your experience.`,
          [
            {
              text: 'Rate Worker',
              onPress: () => {
                navigation.navigate('Rating', { booking });
              },
            },
            {
              text: 'Back to Bookings',
              onPress: () => {
                navigation.navigate('BookingsTab');
              },
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          'Payment Failed',
          'Payment could not be processed. Please check your payment details and try again.',
          [
            {
              text: 'Try Again',
              style: 'default',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethodCard: React.FC<{ method: PaymentMethod }> = ({ method }) => (
    <TouchableOpacity
      style={[
        styles.paymentMethodCard,
        selectedMethod === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedMethod(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodName}>{method.name}</Text>
          <Text style={styles.paymentMethodDetails}>{method.details}</Text>
        </View>
        <View style={styles.radioButton}>
          {selectedMethod === method.id && <View style={styles.radioButtonSelected} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <View style={styles.paymentForm}>
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={paymentDetails.cardNumber}
              onChangeText={(text) => setPaymentDetails({...paymentDetails, cardNumber: text})}
              keyboardType="numeric"
            />
            <View style={styles.cardRow}>
              <View style={styles.halfInput}>
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChangeText={(text) => setPaymentDetails({...paymentDetails, expiryDate: text})}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="CVV"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChangeText={(text) => setPaymentDetails({...paymentDetails, cvv: text})}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
            </View>
            <Input
              label="Card Holder Name"
              placeholder="John Doe"
              value={paymentDetails.cardHolderName}
              onChangeText={(text) => setPaymentDetails({...paymentDetails, cardHolderName: text})}
            />
          </View>
        );
      case 'easypaisa':
      case 'jazzcash':
        return (
          <View style={styles.paymentForm}>
            <Input
              label="Mobile Number"
              placeholder="03xxxxxxxxx"
              value={paymentDetails.mobileNumber}
              onChangeText={(text) => setPaymentDetails({...paymentDetails, mobileNumber: text})}
              keyboardType="phone-pad"
            />
            <View style={styles.mobilePaymentInfo}>
              <Text style={styles.mobilePaymentText}>
                📱 You will receive an OTP on your registered mobile number
              </Text>
            </View>
          </View>
        );
      case 'bank':
        return (
          <View style={styles.paymentForm}>
            <Input
              label="Bank Account Number"
              placeholder="Enter your account number"
              value={paymentDetails.bankAccount}
              onChangeText={(text) => setPaymentDetails({...paymentDetails, bankAccount: text})}
              keyboardType="numeric"
            />
            <View style={styles.bankPaymentInfo}>
              <Text style={styles.bankPaymentText}>
                🏦 Transfer will be processed within 1-2 business days
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Payment</Text>
        </View>

        {/* Booking Summary */}
        <View style={styles.bookingSummary}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Task:</Text>
            <Text style={styles.summaryValue}>{booking.task}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {new Date(booking.date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </View>

        {/* Payment Form */}
        {selectedMethod && renderPaymentForm()}

        {/* Pay Button */}
        {selectedMethod && (
          <View style={styles.payButtonContainer}>
            <Button
              title={loading ? 'Processing Payment...' : 'Complete Payment'}
              onPress={handlePayment}
              loading={loading}
              style={styles.payButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    marginRight: spacing.md,
  },
  backText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.gray[900],
  },
  bookingSummary: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    color: colors.gray[900],
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentMethodsSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  paymentMethodCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  paymentMethodDetails: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  paymentForm: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  mobilePaymentInfo: {
    backgroundColor: colors.info + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  mobilePaymentText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
    textAlign: 'center',
  },
  bankPaymentInfo: {
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  bankPaymentText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
    textAlign: 'center',
  },
  payButtonContainer: {
    padding: spacing.lg,
  },
  payButton: {
    width: '100%',
  },
}); 