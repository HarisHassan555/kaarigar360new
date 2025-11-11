export interface User {
  uid: string;
  role: 'employer' | 'worker' | 'admin';
  phoneNumber: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    fullName: string; // Computed from firstName + lastName
    address: string;
    cnic?: string;
    cnicVerified: boolean;
    cnicPhotos?: {
      front: string; // URL to CNIC front photo
      back: string;  // URL to CNIC back photo
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
  availabilityStatus?: 'available' | 'unavailable';
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

export interface Availability {
  workerId: string;
  dates: {
    [date: string]: {
      available: boolean;
      slots: string[];
    };
  };
}

export interface Rating {
  bookingId: string;
  workerId: string;
  employerId: string;
  rating: number;
  review: string;
  createdAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  address: string;
  cnic: string;
  cnicFrontPhoto?: string;
  cnicBackPhoto?: string;
  role: 'employer' | 'worker';
}

export const WORKER_SKILLS = [
  'Carpenter',
  'Electrician',
  'Plumber',
  'Mason',
  'Painter',
  'Welder',
  'Roofer',
  'Tiler',
  'HVAC Technician',
  'General Labor',
] as const; 