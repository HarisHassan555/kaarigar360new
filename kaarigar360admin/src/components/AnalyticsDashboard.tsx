import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { getDashboardStats, getAllUsers, getAllBookings } from '../services/adminService';
import type { User, Booking } from '../types';
import type { DashboardStats } from '../types/admin';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Loading analytics data...');
      
      const [statsData, usersData, bookingsData] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getAllBookings()
      ]);
      
      console.log('✅ Analytics data loaded:', {
        stats: statsData,
        usersCount: usersData.length,
        bookingsCount: bookingsData.length
      });
      
      setStats(statsData);
      setUsers(usersData);
      setBookings(bookingsData);
    } catch (error: any) {
      console.error('❌ Error loading analytics data:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    if (!bookings || bookings.length === 0) return [];
    
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = subDays(now, daysAgo);
    
    return bookings.filter(booking => {
      try {
        let bookingDate: Date;
        if (booking.createdAt instanceof Date) {
          bookingDate = booking.createdAt;
        } else if (booking.createdAt?.toDate) {
          bookingDate = booking.createdAt.toDate();
        } else {
          bookingDate = new Date(booking.createdAt);
        }
        return bookingDate >= cutoffDate;
      } catch (e) {
        console.warn('Error filtering booking date:', e, booking);
        return false;
      }
    });
  };

  const getFilteredUsers = () => {
    if (!users || users.length === 0) return [];
    
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = subDays(now, daysAgo);
    
    return users.filter(user => {
      try {
        let userDate: Date;
        if (user.createdAt instanceof Date) {
          userDate = user.createdAt;
        } else if (user.createdAt?.toDate) {
          userDate = user.createdAt.toDate();
        } else {
          userDate = new Date(user.createdAt);
        }
        return userDate >= cutoffDate;
      } catch (e) {
        console.warn('Error filtering user date:', e, user);
        return false;
      }
    });
  };

  const getRevenueByMonth = () => {
    const monthlyRevenue: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      if (booking.status === 'completed') {
        try {
          const bookingDate = booking.createdAt instanceof Date 
            ? booking.createdAt 
            : (booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt));
          const month = format(bookingDate, 'MMM yyyy');
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (booking.payment?.amount || 0);
        } catch (e) {
          console.warn('Error processing booking date:', e, booking);
        }
      }
    });
    
    const entries = Object.entries(monthlyRevenue);
    if (entries.length === 0) return [];
    
    return entries
      .sort((a, b) => {
        try {
          return new Date(a[0]).getTime() - new Date(b[0]).getTime();
        } catch {
          return 0;
        }
      })
      .slice(-6); // Last 6 months
  };

  const getBookingStatusDistribution = () => {
    const statusCounts = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0
    };
    
    bookings.forEach(booking => {
      statusCounts[booking.status]++;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: bookings.length > 0 ? (count / bookings.length) * 100 : 0
    }));
  };

  const getTopSkills = () => {
    const skillCounts: { [key: string]: number } = {};
    
    users.forEach(user => {
      if (user.role === 'worker' && user.profile.skills) {
        user.profile.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });
    
    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadAnalyticsData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const filteredUsers = getFilteredUsers();
  const revenueByMonth = getRevenueByMonth();
  const statusDistribution = getBookingStatusDistribution();
  const topSkills = getTopSkills();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Users ({timeRange})</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredUsers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Bookings ({timeRange})</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredBookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue ({timeRange})</p>
              <p className="text-2xl font-semibold text-gray-900">
                PKR {filteredBookings
                  .filter(b => b.status === 'completed')
                  .reduce((sum, b) => sum + (b.payment?.amount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredBookings.length > 0 
                  ? Math.round((filteredBookings.filter(b => b.status === 'completed').length / filteredBookings.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Revenue Trend
          </h4>
          <div className="space-y-3">
            {revenueByMonth.length > 0 ? (
              revenueByMonth.map(([month, revenue]) => {
                const maxRevenue = Math.max(...revenueByMonth.map(r => r[1]));
                const percentage = maxRevenue > 0 ? Math.min(100, (revenue / maxRevenue) * 100) : 0;
                return (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">PKR {revenue.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No revenue data available</p>
            )}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Booking Status Distribution
          </h4>
          <div className="space-y-3">
            {statusDistribution.map(({ status, count, percentage }) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'Completed' ? 'bg-green-500' :
                        status === 'Pending' ? 'bg-yellow-500' :
                        status === 'Accepted' ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Top Worker Skills
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topSkills.length > 0 ? (
            topSkills.map(({ skill, count }) => (
              <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{skill}</span>
                <span className="text-sm text-gray-600">{count} workers</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full text-center py-4">No skills data available</p>
          )}
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">User Growth</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'worker').length}</div>
            <div className="text-sm text-gray-600">Total Workers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'employer').length}</div>
            <div className="text-sm text-gray-600">Total Employers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.status === 'approved').length}</div>
            <div className="text-sm text-gray-600">Approved Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}
