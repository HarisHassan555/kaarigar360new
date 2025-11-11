export type UserRole = 'employer' | 'worker' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  phoneNumber: string;
  email?: string;
  profile: {
    name: string;
    cnic?: string;
    cnicVerified: boolean;
    skills?: string[];
    rating?: number;
  };
  createdAt: Date;
} 