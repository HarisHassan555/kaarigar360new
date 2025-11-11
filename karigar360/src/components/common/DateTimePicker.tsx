import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode: 'date' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const DateTimePickerComponent: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode,
  minimumDate,
  maximumDate,
  error,
  containerStyle,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [tempHour, setTempHour] = useState(value.getHours() % 12 || 12);
  const [tempMinute, setTempMinute] = useState(value.getMinutes());
  const [tempAmPm, setTempAmPm] = useState(value.getHours() >= 12 ? 'PM' : 'AM');
  const [tempDate, setTempDate] = useState(value);
  
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const dateScrollRef = useRef<ScrollView>(null);

  // Constants for infinite scroll
  const ITEM_HEIGHT = 50;
  const VISIBLE_ITEMS = 5; // Number of items visible at once
  const CENTER_OFFSET = ITEM_HEIGHT * 2; // Offset to center the selection
  const LOOPS = 1000; // High number for true infinite scroll

  // Infinite scroll recentering logic
  const recenterScroll = (scrollRef: React.RefObject<ScrollView>, totalItems: number, currentIndex: number) => {
    const totalHeight = totalItems * ITEM_HEIGHT;
    const currentOffset = currentIndex * ITEM_HEIGHT;
    const middleOffset = (totalItems / 2) * ITEM_HEIGHT;
    
    // If we're too close to the beginning, jump to the middle
    if (currentOffset < totalHeight * 0.1) {
      scrollRef.current?.scrollTo({ y: currentOffset + middleOffset, animated: false });
    }
    // If we're too close to the end, jump back to the middle
    else if (currentOffset > totalHeight * 0.9) {
      scrollRef.current?.scrollTo({ y: currentOffset - middleOffset, animated: false });
    }
  };

  const formatDate = (date: Date): string => {
    if (mode === 'date') {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const formatDateForPicker = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const showDatePicker = () => {
    if (!disabled) {
      setTempValue(value);
      if (mode === 'time') {
        setTempHour(value.getHours() % 12 || 12);
        setTempMinute(value.getMinutes());
        setTempAmPm(value.getHours() >= 12 ? 'PM' : 'AM');
        setTempDate(value);
      }
      setShowPicker(true);
    }
  };

  // Auto-scroll to selected values when picker opens
  useEffect(() => {
    if (showPicker && mode === 'time') {
      // Calculate initial scroll positions for infinite scroll
      const hourOffset = (LOOPS / 2) * 12 * ITEM_HEIGHT + (tempHour - 1) * ITEM_HEIGHT;
      const minuteOffset = (LOOPS / 2) * 60 * ITEM_HEIGHT + tempMinute * ITEM_HEIGHT;
      const dateOffset = (LOOPS / 2) * 365 * ITEM_HEIGHT + Math.floor((tempDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) * ITEM_HEIGHT;
      
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({ y: hourOffset, animated: false });
        minuteScrollRef.current?.scrollTo({ y: minuteOffset, animated: false });
        dateScrollRef.current?.scrollTo({ y: dateOffset, animated: false });
      }, 100);
    }
  }, [showPicker, mode, tempHour, tempMinute, tempDate]);

  const handleConfirm = () => {
    if (mode === 'time') {
      // Convert 12-hour format to 24-hour format
      let hour24 = tempHour;
      if (tempAmPm === 'PM' && tempHour !== 12) {
        hour24 = tempHour + 12;
      } else if (tempAmPm === 'AM' && tempHour === 12) {
        hour24 = 0;
      }
      
      const newTime = new Date(tempDate);
      newTime.setHours(hour24, tempMinute, 0, 0);
      onChange(newTime);
    } else {
      onChange(tempValue);
    }
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    if (mode === 'time') {
      setTempHour(value.getHours() % 12 || 12);
      setTempMinute(value.getMinutes());
      setTempAmPm(value.getHours() >= 12 ? 'PM' : 'AM');
      setTempDate(value);
    }
    setShowPicker(false);
  };

  const generateDateOptions = () => {
    if (mode === 'date') {
      const options = [];
      const startDate = minimumDate || new Date();
      const endDate = maximumDate || new Date(new Date().getFullYear() + 1, 11, 31);
      
      // Generate dates with better grouping
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        options.push(new Date(d));
      }
      return options;
    } else {
      // Generate time options (every 15 minutes) in 12-hour format
      const options = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          options.push(date);
        }
      }
      return options;
    }
  };

  const options = generateDateOptions();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.pickerButton,
          error && styles.pickerButtonError,
          disabled && styles.pickerButtonDisabled,
        ]}
        onPress={showDatePicker}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.pickerContent}>
          <View style={styles.pickerIconContainer}>
            <Text style={styles.pickerIcon}>
              {mode === 'date' ? '📅' : '🕐'}
            </Text>
          </View>
          <View style={styles.pickerTextContainer}>
            <Text style={[
              styles.pickerText,
              disabled && styles.pickerTextDisabled,
            ]}>
              {formatDate(value)}
            </Text>
            <Text style={[
              styles.pickerLabel,
              disabled && styles.pickerLabelDisabled,
            ]}>
              {mode === 'date' ? 'Tap to select date' : 'Tap to select time'}
            </Text>
          </View>
          <View style={styles.pickerArrowContainer}>
            <Text style={styles.pickerArrow}>▼</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                Select {mode === 'date' ? 'Date' : 'Time'}
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmButton}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
              {mode === 'date' ? (
                // Group dates by month for better organization
                (() => {
                  const groupedDates: { [key: string]: Date[] } = {};
                  options.forEach(date => {
                    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    if (!groupedDates[monthKey]) {
                      groupedDates[monthKey] = [];
                    }
                    groupedDates[monthKey].push(date);
                  });

                  return Object.entries(groupedDates).map(([month, dates]) => (
                    <View key={month} style={styles.monthGroup}>
                      <Text style={styles.monthHeader}>{month}</Text>
                      {dates.map((date, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionItem,
                            tempValue.getTime() === date.getTime() && styles.selectedOption,
                          ]}
                          onPress={() => setTempValue(date)}
                        >
                          <View style={styles.dateOptionContent}>
                            <Text style={[
                              styles.dateWeekday,
                              tempValue.getTime() === date.getTime() && styles.selectedOptionText,
                            ]}>
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </Text>
                            <Text style={[
                              styles.dateNumber,
                              tempValue.getTime() === date.getTime() && styles.selectedOptionText,
                            ]}>
                              {date.getDate()}
                            </Text>
                          </View>
                          {tempValue.getTime() === date.getTime() && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ));
                })()
              ) : (
                // Infinite scroll time picker with white selection band
                <View style={styles.timePickerContainer}>
                  <View style={styles.pickerWrapper}>
                    {/* White selection band */}
                    <View style={styles.selectionBand} />
                    
                    {/* Fade effects */}
                    <View style={styles.pickerFadeTop} />
                    <View style={styles.pickerFadeBottom} />
                    
                    <View style={styles.pickerColumns}>
                      {/* Date Column */}
                      <View style={styles.pickerColumn}>
                        <ScrollView
                          ref={dateScrollRef}
                          style={styles.pickerScrollView}
                          showsVerticalScrollIndicator={false}
                          snapToInterval={ITEM_HEIGHT}
                          decelerationRate="fast"
                          onScroll={(e) => {
                            const y = e.nativeEvent.contentOffset.y;
                            const index = Math.round(y / ITEM_HEIGHT);
                            const daysFromToday = index - (LOOPS / 2) * 365;
                            const newDate = new Date();
                            newDate.setDate(newDate.getDate() + daysFromToday);
                            setTempDate(newDate);
                            recenterScroll(dateScrollRef, LOOPS * 365, index);
                          }}
                          scrollEventThrottle={16}
                        >
                          {Array.from({ length: LOOPS * 365 }, (_, i) => {
                            const daysFromToday = i - (LOOPS / 2) * 365;
                            const date = new Date();
                            date.setDate(date.getDate() + daysFromToday);
                            const isSelected = Math.abs(daysFromToday) < 1; // Today
                            
                            return (
                              <View key={`date-${i}`} style={styles.pickerItem}>
                                <Text style={[
                                  styles.pickerItemText,
                                  isSelected && styles.selectedPickerItemText,
                                ]}>
                                  {formatDateForPicker(date)}
                                </Text>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>

                      {/* Hour Column */}
                      <View style={styles.pickerColumn}>
                        <ScrollView
                          ref={hourScrollRef}
                          style={styles.pickerScrollView}
                          showsVerticalScrollIndicator={false}
                          snapToInterval={ITEM_HEIGHT}
                          decelerationRate="fast"
                          onScroll={(e) => {
                            const y = e.nativeEvent.contentOffset.y;
                            const index = Math.round(y / ITEM_HEIGHT);
                            const hour = ((index % 12) + 12) % 12 + 1;
                            setTempHour(hour);
                            recenterScroll(hourScrollRef, LOOPS * 12, index);
                          }}
                          scrollEventThrottle={16}
                        >
                          {Array.from({ length: LOOPS * 12 }, (_, i) => {
                            const hour = (i % 12) + 1;
                            const isSelected = hour === tempHour;
                            
                            return (
                              <View key={`hour-${i}`} style={styles.pickerItem}>
                                <Text style={[
                                  styles.pickerItemText,
                                  isSelected && styles.selectedPickerItemText,
                                ]}>
                                  {hour}
                                </Text>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>

                      {/* Minute Column */}
                      <View style={styles.pickerColumn}>
                        <ScrollView
                          ref={minuteScrollRef}
                          style={styles.pickerScrollView}
                          showsVerticalScrollIndicator={false}
                          snapToInterval={ITEM_HEIGHT}
                          decelerationRate="fast"
                          onScroll={(e) => {
                            const y = e.nativeEvent.contentOffset.y;
                            const index = Math.round(y / ITEM_HEIGHT);
                            const minute = ((index % 60) + 60) % 60;
                            setTempMinute(minute);
                            recenterScroll(minuteScrollRef, LOOPS * 60, index);
                          }}
                          scrollEventThrottle={16}
                        >
                          {Array.from({ length: LOOPS * 60 }, (_, i) => {
                            const minute = i % 60;
                            const isSelected = minute === tempMinute;
                            
                            return (
                              <View key={`minute-${i}`} style={styles.pickerItem}>
                                <Text style={[
                                  styles.pickerItemText,
                                  isSelected && styles.selectedPickerItemText,
                                ]}>
                                  {minute.toString().padStart(2, '0')}
                                </Text>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>

                      {/* AM/PM Column */}
                      <View style={styles.pickerColumn}>
                        <ScrollView
                          style={styles.pickerScrollView}
                          showsVerticalScrollIndicator={false}
                          snapToInterval={ITEM_HEIGHT}
                          decelerationRate="fast"
                        >
                          {Array.from({ length: LOOPS * 2 }, (_, i) => {
                            const ampm = i % 2 === 0 ? 'AM' : 'PM';
                            const isSelected = ampm === tempAmPm;
                            
                            return (
                              <TouchableOpacity
                                key={`ampm-${i}`}
                                style={styles.pickerItem}
                                onPress={() => setTempAmPm(ampm)}
                              >
                                <Text style={[
                                  styles.pickerItemText,
                                  isSelected && styles.selectedPickerItemText,
                                ]}>
                                  {ampm}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  pickerButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    minHeight: 64,
    shadowColor: colors.gray[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerButtonError: {
    borderColor: colors.error,
  },
  pickerButtonDisabled: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flex: 1,
  },
  pickerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pickerIcon: {
    fontSize: 20,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.gray[900],
    marginBottom: 2,
  },
  pickerTextDisabled: {
    color: colors.gray[500],
  },
  pickerLabel: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
  },
  pickerLabelDisabled: {
    color: colors.gray[400],
  },
  pickerArrowContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerArrow: {
    fontSize: 12,
    color: colors.gray[400],
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    shadowColor: colors.gray[900],
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.gray[900],
  },
  cancelButton: {
    fontSize: typography.sizes.md,
    color: colors.gray[500],
    fontWeight: typography.weights.medium as any,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  confirmButton: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold as any,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionsContainer: {
    maxHeight: 400,
  },
  monthGroup: {
    marginBottom: spacing.lg,
  },
  monthHeader: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  timePickerContainer: {
    padding: spacing.lg,
  },
  pickerWrapper: {
    position: 'relative',
    height: 250,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: colors.gray[50],
    zIndex: 2,
    pointerEvents: 'none',
  },
  pickerFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: colors.gray[50],
    zIndex: 2,
    pointerEvents: 'none',
  },
  selectionBand: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.white,
    marginTop: -25,
    zIndex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
  },
  pickerColumns: {
    flexDirection: 'row',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    position: 'relative',
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerItem: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium as any,
    color: colors.gray[500],
  },
  selectedPickerItemText: {
    color: colors.gray[900],
    fontWeight: typography.weights.bold as any,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
    minHeight: 56,
  },
  selectedOption: {
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  dateOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateWeekday: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    fontWeight: typography.weights.medium as any,
    marginRight: spacing.md,
    minWidth: 40,
  },
  dateNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.gray[900],
    marginRight: spacing.sm,
  },
  optionText: {
    fontSize: typography.sizes.lg,
    color: colors.gray[900],
    fontWeight: typography.weights.medium as any,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: typography.weights.bold as any,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
});
