import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getBookings } from '../../services/firebase/bookingService';
import { useAppSelector } from '../../store/hooks';
import { Booking } from '../../types';
import { shadows, spacing, typography, borderRadius } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasJobs: boolean;
  jobCount: number;
}

export const ScheduleScreen: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const styles = getStyles(colors);

  // Helper function to get date string in YYYY-MM-DD format using local timezone
  const getDateString = (date: Date): string => {
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, bookings]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const workerBookings = await getBookings(undefined, user.uid);
      setBookings(workerBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert(t('common.error'), t('schedule.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first day of calendar (including previous month's days)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Get last day of calendar (including next month's days)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startDate);
    
    while (currentDateIter <= endDate) {
      const isCurrentMonth = currentDateIter.getMonth() === month;
      const isToday = currentDateIter.toDateString() === today.toDateString();
      const isSelected = selectedDate ? currentDateIter.toDateString() === selectedDate.toDateString() : false;
      
      // Count jobs for this date - use local date methods to avoid timezone issues
      const dateStr = getDateString(currentDateIter);
      
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        const bookingDateStr = getDateString(bookingDate);
        return bookingDateStr === dateStr;
      });
      
      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth,
        isToday,
        isSelected,
        hasJobs: dayBookings.length > 0,
        jobCount: dayBookings.length,
      });
      
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const getJobsForDate = (date: Date) => {
    // Use local date methods to avoid timezone issues
    const dateStr = getDateString(date);
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      const bookingDateStr = getDateString(bookingDate);
      return bookingDateStr === dateStr;
    });
  };

  const getBookingsForCurrentMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'accepted':
        return colors.success;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('schedule.pending');
      case 'accepted':
        return t('myBookings.accepted');
      case 'completed':
        return t('schedule.completed');
      case 'cancelled':
        return t('myBookings.cancelled');
      default:
        return status;
    }
  };

  const renderCalendarDay = ({ item }: { item: CalendarDay }) => {
    const { date, isCurrentMonth, isToday, isSelected, hasJobs, jobCount } = item;
    
    return (
      <TouchableOpacity
        style={[
          styles.calendarDay,
          !isCurrentMonth && styles.calendarDayOtherMonth,
          isToday && styles.calendarDayToday,
          isSelected && styles.calendarDaySelected,
        ]}
        onPress={() => selectDate(date)}
      >
        <Text
          style={[
            styles.calendarDayText,
            !isCurrentMonth && styles.calendarDayTextOtherMonth,
            isToday && styles.calendarDayTextToday,
            isSelected && styles.calendarDayTextSelected,
          ]}
        >
          {date.getDate()}
        </Text>
        {hasJobs && (
          <View style={styles.jobIndicator}>
            <Text style={styles.jobCountText}>{jobCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };


  const selectedDateJobs = selectedDate ? getJobsForDate(selectedDate) : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Colored Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>SCHEDULE</Text>
          <Text style={styles.headerSubtitle}>
            {selectedDate ? formatDate(selectedDate) : t('schedule.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Back Button - only show when date is selected */}
        {selectedDate && (
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedDate(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>{t('schedule.backToCalendar')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Calendar View - only show when no date is selected */}
        {!selectedDate && (
          <>
            {/* Calendar Navigation */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('prev')}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={colors.white} />
              </TouchableOpacity>
              
              <Text style={styles.monthYear}>
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarContainer}>
              {/* Day headers */}
              <View style={styles.dayHeaders}>
                {[
                  t('schedule.sunday'),
                  t('schedule.monday'),
                  t('schedule.tuesday'),
                  t('schedule.wednesday'),
                  t('schedule.thursday'),
                  t('schedule.friday'),
                  t('schedule.saturday')
                ].map((day) => (
                  <Text key={day} style={styles.dayHeader}>
                    {day}
                  </Text>
                ))}
              </View>
              
              {/* Calendar days - using View instead of FlatList to avoid nesting */}
              <View style={styles.calendarGrid}>
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                  <View key={weekIndex} style={styles.calendarRow}>
                    {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                      <TouchableOpacity
                        key={dayIndex}
                        style={[
                          styles.calendarDay,
                          !day.isCurrentMonth && styles.calendarDayOtherMonth,
                          day.isToday && styles.calendarDayToday,
                          day.isSelected && styles.calendarDaySelected,
                        ]}
                        onPress={() => selectDate(day.date)}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                            day.isToday && styles.calendarDayTextToday,
                            day.isSelected && styles.calendarDayTextSelected,
                          ]}
                        >
                          {day.date.getDate()}
                        </Text>
                        {day.hasJobs && (
                          <View style={styles.jobIndicator}>
                            <Text style={styles.jobCountText}>{day.jobCount}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Selected Date Jobs - only show when date is selected */}
        {selectedDate && (
          <View style={styles.selectedDateSection}>
            <View style={styles.selectedDateHeader}>
              <Text style={styles.jobCount}>
                {selectedDateJobs.length === 1 
                  ? t('schedule.jobsScheduled', { count: selectedDateJobs.length })
                  : t('schedule.jobsScheduledPlural', { count: selectedDateJobs.length })}
              </Text>
            </View>
            
             {selectedDateJobs.length > 0 ? (
               <View style={styles.jobsList}>
                 {selectedDateJobs.map((job) => (
                   <View key={job.id} style={styles.jobCard}>
                     <View style={styles.jobHeader}>
                       <Text style={styles.jobTitle}>{job.task || job.service || 'Task'}</Text>
                       <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                         <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
                       </View>
                     </View>
                     
                     <View style={styles.jobDetails}>
                       <View style={styles.jobDetailItem}>
                         <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                         <Text style={styles.jobDetailText}>{new Date(job.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                       </View>
                       <View style={styles.jobDetailItem}>
                         <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                         <Text style={styles.jobDetailText}>{job.employerName || 'Employer'}</Text>
                       </View>
                       <View style={styles.jobDetailItem}>
                         <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                         <Text style={styles.jobDetailText}>{typeof job.location === 'string' ? job.location : job.location?.address || t('schedule.locationNotSpecified')}</Text>
                       </View>
                       <View style={styles.jobDetailItem}>
                         <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                         <Text style={styles.jobDetailText}>Rs. {job.payment?.amount || 0}</Text>
                       </View>
                     </View>
                     
                     {job.description && (
                       <Text style={styles.jobDescription}>{job.description}</Text>
                     )}
                   </View>
                 ))}
               </View>
             ) : (
              <View style={styles.noJobsContainer}>
                <Text style={styles.noJobsText}>{t('schedule.noJobsScheduled')}</Text>
                <Text style={styles.noJobsSubtext}>{t('schedule.enjoyDayOff')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Stats - only show when no date is selected */}
        {!selectedDate && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {getBookingsForCurrentMonth().filter(b => b.status === 'accepted').length}
              </Text>
              <Text style={styles.statLabel}>{t('schedule.upcoming')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {getBookingsForCurrentMonth().filter(b => b.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>{t('schedule.completed')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {getBookingsForCurrentMonth().filter(b => b.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>{t('schedule.pending')}</Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  calendarRow: {
    flexDirection: 'row',
  },
  // Header Section
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
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.9,
  },
  backButtonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.primary,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYear: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
  calendarGrid: {
    flexGrow: 0,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: borderRadius.md,
    position: 'relative',
    backgroundColor: colors.background,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: colors.primary,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  calendarDayText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  calendarDayTextOtherMonth: {
    color: colors.textSecondary,
  },
  calendarDayTextToday: {
    color: colors.white,
    fontWeight: typography.weights.bold as any,
  },
  calendarDayTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold as any,
  },
  jobIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.success,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  selectedDateSection: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedDateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  jobCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
   jobsList: {
     flex: 1,
   },
  jobCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  jobDetails: {
    marginTop: spacing.xs,
    gap: spacing.xs / 2,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  jobDetailText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  jobTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium as any,
    color: colors.white,
  },
  jobDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  noJobsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noJobsText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  noJobsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
