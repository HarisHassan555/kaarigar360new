import { Booking, Worker } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type EmployerStackParamList = {
  Home: undefined;
  WorkerSearch: undefined;
  WorkerProfile: { workerId: string };
  Booking: { worker: Worker };
  Payment: { booking: Booking };
  MyBookings: undefined;
  Rating: { booking: Booking };
};

export type WorkerStackParamList = {
  HomeTab: undefined;
  BookingsTab: undefined;
  ScheduleTab: undefined;
  ProfileTab: undefined;
};

export type AdminStackParamList = {
  Dashboard: undefined;
  UserManagement: undefined;
  VerificationRequests: undefined;
  Disputes: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  StatusCheck: undefined;
  EmployerMain: undefined;
  WorkerMain: undefined;
  AdminMain: undefined;
}; 