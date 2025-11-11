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
import { useTheme } from '../../hooks/useTheme';
import { getBookings } from '../../services/firebase/bookingService';
import { useAppSelector } from '../../store/hooks';
import { Booking } from '../../types';
import { shadows, spacing, typography } from '../../utils/theme';

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
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
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
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {selectedDate ? formatDate(selectedDate) : 'My Schedule'}
          </Text>
          <Text style={styles.subtitle}>
            {selectedDate ? 'Daily job details' : 'View and manage your daily jobs'}
          </Text>
        </View>

        {/* Back Button - only show when date is selected */}
        {selectedDate && (
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedDate(null)}
            >
              <Text style={styles.backButtonText}>← Back to Calendar</Text>
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
              >
                <Text style={styles.navButtonText}>‹</Text>
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
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarContainer}>
              {/* Day headers */}
              <View style={styles.dayHeaders}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
                {selectedDateJobs.length} job{selectedDateJobs.length !== 1 ? 's' : ''} scheduled
              </Text>
            </View>
            
             {selectedDateJobs.length > 0 ? (
               <View style={styles.jobsList}>
                 {selectedDateJobs.map((job) => (
                   <View key={job.id} style={styles.jobCard}>
                     <View style={styles.jobHeader}>
                       <Text style={styles.jobTitle}>{job.service}</Text>
                       <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                         <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
                       </View>
                     </View>
                     
                     <View style={styles.jobDetails}>
                       <Text style={styles.jobTime}>🕐 {new Date(job.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                       <Text style={styles.jobClient}>👤 {job.employerName}</Text>
                       <Text style={styles.jobLocation}>📍 {typeof job.location === 'string' ? job.location : job.location?.address || 'Location not specified'}</Text>
                       <Text style={styles.jobPrice}>💰 Rs. {job.payment?.amount || 0}</Text>
                     </View>
                     
                     {job.description && (
                       <Text style={styles.jobDescription}>{job.description}</Text>
                     )}
                   </View>
                 ))}
               </View>
             ) : (
              <View style={styles.noJobsContainer}>
                <Text style={styles.noJobsText}>No jobs scheduled for this day</Text>
                <Text style={styles.noJobsSubtext}>Enjoy your day off! 🎉</Text>
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
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {getBookingsForCurrentMonth().filter(b => b.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {getBookingsForCurrentMonth().filter(b => b.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
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
  backButtonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  monthYear: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
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
    borderRadius: 8,
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
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.sm,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedDateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  jobCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
   jobsList: {
     flex: 1,
   },
  jobCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  jobTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium as any,
    color: colors.white,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  jobTime: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  jobClient: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  jobLocation: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  jobPrice: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  jobDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
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
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
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
