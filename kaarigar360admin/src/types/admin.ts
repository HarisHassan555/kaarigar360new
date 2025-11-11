export interface AdminAction {
  id: string;
  adminId: string;
  targetUserId: string;
  action: 'approve_user' | 'reject_user' | 'suspend_user' | 'resolve_dispute' | 'verify_cnic';
  details: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  pendingApprovals: number;
  activeBookings: number;
  completedBookings: number;
  pendingDisputes: number;
  totalRevenue: number;
  monthlyRevenue: number;
}
