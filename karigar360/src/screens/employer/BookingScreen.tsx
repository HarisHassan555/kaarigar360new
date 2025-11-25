import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../hooks/useTheme';
import { EmployerStackParamList } from '../../navigation/types';
import { createBooking } from '../../services/firebase/bookingService';
import { useAppSelector } from '../../store/hooks';
import { Booking } from '../../types';
import { shadows, spacing, typography } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<EmployerStackParamList, 'Booking'>;

export const BookingScreen = ({ route, navigation }: Props) => {
  const { worker } = route.params;
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Time picker state
  const [tempHour, setTempHour] = useState(selectedTime.getHours() % 12 || 12);
  const [tempMinute, setTempMinute] = useState(selectedTime.getMinutes());
  const [tempAmPm, setTempAmPm] = useState(selectedTime.getHours() >= 12 ? 'PM' : 'AM');

  const styles = getStyles(colors);

  // Generate date options (next 30 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate hours (1-12)
  const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // Generate minutes (0-59)
  const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimePickerOpen = () => {
    // Set temp values to current selected time
    setTempHour(selectedTime.getHours() % 12 || 12);
    setTempMinute(selectedTime.getMinutes());
    setTempAmPm(selectedTime.getHours() >= 12 ? 'PM' : 'AM');
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    // Convert to 24-hour format
    let hour24 = tempHour;
    if (tempAmPm === 'PM' && tempHour !== 12) {
      hour24 = tempHour + 12;
    } else if (tempAmPm === 'AM' && tempHour === 12) {
      hour24 = 0;
    }
    
    const newTime = new Date();
    newTime.setHours(hour24, tempMinute, 0, 0);
    setSelectedTime(newTime);
    setShowTimePicker(false);
  };

  const handleBooking = async () => {
    if (!task || !address) {
      Alert.alert(t('common.error'), t('booking.fillRequiredFields'));
      return;
    }

    if (!user) {
      Alert.alert(t('common.error'), t('auth.enterBothFields'));
      return;
    }

    // Combine selected date and time
    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    
    // Basic date validation
    if (combinedDateTime <= new Date()) {
      Alert.alert(t('common.error'), 'Please select a future date and time');
      return;
    }

    setLoading(true);

    try {
      const bookingData: Omit<Booking, 'id' | 'createdAt'> = {
        workerId: worker.uid,
        employerId: user.uid,
        status: 'pending',
        date: combinedDateTime,
        task,
        description,
        location: {
          latitude: 0, // In real app, this would come from location picker
          longitude: 0,
          address,
        },
        payment: {
          amount: worker?.profile?.hourlyRate || 1500,
          status: 'pending',
        },
      };

      const newBooking = await createBooking(bookingData);

      Alert.alert(
        t('booking.bookingSuccess'),
        `Your booking request has been sent to ${worker?.profile?.fullName || 'the worker'}. You will be notified when they accept or decline.`,
        [
          {
            text: t('common.save'),
            onPress: () => {
              // Navigate back to home and let user check bookings tab
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(t('common.error'), t('booking.bookingFailed'));
    } finally {
      setLoading(false);
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
            <Text style={styles.backText}>← {t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('booking.bookWorker')}</Text>
        </View>

        {/* Worker Info */}
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker?.profile?.fullName || t('common.worker')}</Text>
          <Text style={styles.workerSkills}>
            {worker?.profile?.skills?.join(', ') || t('booking.noSkillsListed')}
          </Text>
          <Text style={styles.workerRate}>
            PKR {worker?.profile?.hourlyRate || 1500}/hour
          </Text>
          {worker?.profile?.cnicVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>{t('common.cnicVerified')}</Text>
            </View>
          )}
        </View>

        {/* Booking Form */}
        <View style={styles.form}>
          <Input
            label={`${t('booking.task')} *`}
            placeholder={t('booking.enterTask')}
            value={task}
            onChangeText={setTask}
          />

          <Input
            label={t('booking.description')}
            placeholder={t('booking.enterDescription')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Date Selection */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={styles.costLabel}>{t('booking.selectDate')} *</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{ 
                backgroundColor: colors.surface, 
                padding: spacing.md, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: colors.border,
                marginTop: spacing.xs,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14 }}>
                📅 {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={{ color: colors.textSecondary }}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Time Selection */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={styles.costLabel}>{t('booking.time')} *</Text>
            <TouchableOpacity
              onPress={handleTimePickerOpen}
              style={{ 
                backgroundColor: colors.surface, 
                padding: spacing.md, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: colors.border,
                marginTop: spacing.xs,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14 }}>
                🕐 {selectedTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
              <Text style={{ color: colors.textSecondary }}>▼</Text>
            </TouchableOpacity>
          </View>

          <Input
            label={`${t('booking.address')} *`}
            placeholder={t('booking.enterAddress')}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
          />

          {/* Estimated Cost */}
          <View style={styles.costContainer}>
            <Text style={styles.costLabel}>{t('booking.estimatedHourlyRate')}</Text>
            <Text style={styles.costValue}>
              PKR {worker?.profile?.hourlyRate || 1500}
            </Text>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>📝 {t('booking.importantNotes')}</Text>
            <Text style={styles.noteText}>• {t('booking.finalCostNote')}</Text>
            <Text style={styles.noteText}>• {t('booking.workerContactNote')}</Text>
            <Text style={styles.noteText}>• {t('booking.paymentNote')}</Text>
          </View>

          {/* Test with TouchableOpacity instead of Button component */}
          <TouchableOpacity
            onPress={handleBooking}
            disabled={loading}
            style={{ 
              padding: 15, 
              backgroundColor: loading ? colors.gray[400] : colors.primary, 
              borderRadius: 8, 
              alignItems: 'center',
              marginTop: 10
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {loading ? t('booking.booking') : t('booking.bookNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('booking.selectDate')}</Text>
              <View style={{ width: 60 }} />
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {generateDates().map((date, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDateSelect(date)}
                  style={[
                    styles.optionItem,
                    selectedDate.toDateString() === date.toDateString() && styles.selectedOption
                  ]}
                >
                  <View>
                    <Text style={[
                      styles.optionText,
                      selectedDate.toDateString() === date.toDateString() && styles.selectedOptionText
                    ]}>
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                    {index === 0 && <Text style={styles.todayBadge}>{t('booking.today')}</Text>}
                  </View>
                  {selectedDate.toDateString() === date.toDateString() && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('booking.selectTime')}</Text>
              <TouchableOpacity onPress={handleTimeConfirm}>
                <Text style={styles.confirmButton}>{t('booking.done')}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Three-column time picker */}
            <View style={styles.timePickerContainer}>
              {/* Hours Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>{t('booking.hour')}</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {generateHours().map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setTempHour(hour)}
                      style={[
                        styles.timeOption,
                        tempHour === hour && styles.selectedTimeOption
                      ]}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        tempHour === hour && styles.selectedTimeOptionText
                      ]}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minutes Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>{t('booking.minute')}</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {generateMinutes().map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setTempMinute(minute)}
                      style={[
                        styles.timeOption,
                        tempMinute === minute && styles.selectedTimeOption
                      ]}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        tempMinute === minute && styles.selectedTimeOptionText
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>{t('booking.period')}</Text>
                <View style={styles.timeScroll}>
                  <TouchableOpacity
                    onPress={() => setTempAmPm('AM')}
                    style={[
                      styles.timeOption,
                      tempAmPm === 'AM' && styles.selectedTimeOption
                    ]}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      tempAmPm === 'AM' && styles.selectedTimeOptionText
                    ]}>
                      {t('booking.am')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setTempAmPm('PM')}
                    style={[
                      styles.timeOption,
                      tempAmPm === 'PM' && styles.selectedTimeOption
                    ]}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      tempAmPm === 'PM' && styles.selectedTimeOptionText
                    ]}>
                      {t('booking.pm')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.text,
  },
  workerInfo: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  workerName: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  workerSkills: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  workerRate: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '500',
  },
  form: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: 12,
    ...shadows.sm,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  costLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  costValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  noteContainer: {
    backgroundColor: colors.info + '20',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    marginBottom: spacing.lg,
  },
  noteTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  noteText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  bookButton: {
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  cancelButton: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
  },
  confirmButton: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary + '15',
  },
  optionText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  todayBadge: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  timePickerContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    height: 300,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timeScroll: {
    flex: 1,
    width: '100%',
  },
  timeOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedTimeOption: {
    backgroundColor: colors.primary + '15',
  },
  timeOptionText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  selectedTimeOptionText: {
    color: colors.primary,
    fontWeight: '700',
  },
}); 