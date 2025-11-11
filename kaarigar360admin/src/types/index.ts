export interface User {
  uid: string;
  role: 'employer' | 'worker' | 'admin';
  phoneNumber: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    address: string;
    cnic?: string;
    cnicVerified: boolean;
    cnicPhotos?: {
      front: string;
      back: string;
    };
    skills?: string[];
    rating?: number;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface Worker extends User {
  role: 'worker';
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    address: string;
    cnic: string;
    cnicVerified: boolean;
    cnicPhotos: {
      front: string;
      back: string;
    };
    skills: string[];
    rating: number;
    description?: string;
    experienceYears?: number;
    hourlyRate?: number;
    profilePicture?: string;
  };
}

export interface Booking {
  id: string;
  workerId: string;
  employerId: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  date: Date;
  task: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  payment: {
    amount: number;
    status: 'pending' | 'completed';
  };
  createdAt: Date;
}

export interface Dispute {
  id: string;
  bookingId: string;
  reporterId: string;
  reportedUserId: string;
  type: 'payment' | 'service' | 'behavior' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}
