import type { User, Worker } from '../types';
import { X, CheckCircle, XCircle, AlertTriangle, User as UserIcon, Mail, Phone, MapPin, CreditCard, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
  onSuspend: (userId: string, reason: string) => void;
}

export default function UserModal({ user, isOpen, onClose, onApprove, onReject, onSuspend }: UserModalProps) {
  if (!isOpen || !user) return null;

  const isWorker = user.role === 'worker';
  const worker = isWorker ? user as Worker : null;

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('🔍 UserModal - User data:', user);
      console.log('🔍 UserModal - Profile:', user.profile);
      console.log('🔍 UserModal - CNIC Photos:', user.profile.cnicPhotos);
      if (user.profile.cnicPhotos) {
        console.log('🔍 UserModal - Front URL:', user.profile.cnicPhotos.front);
        console.log('🔍 UserModal - Back URL:', user.profile.cnicPhotos.back);
      }
    }
  }, [user]);

  const handleReject = () => {
    const reason = prompt('Enter rejection reason:');
    if (reason && reason.trim()) {
      onReject(user.uid, reason);
    }
  };

  const handleSuspend = () => {
    const reason = prompt('Enter suspension reason:');
    if (reason && reason.trim()) {
      onSuspend(user.uid, reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-sm text-gray-900">{user.profile.fullName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phoneNumber}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {user.profile.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification & Status */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Verification & Status
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNIC</label>
                  <p className="text-sm text-gray-900">{user.profile.cnic || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNIC Verified</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.profile.cnicVerified 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.profile.cnicVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : user.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="text-sm text-gray-900">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Worker-specific information */}
          {isWorker && worker && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <Wrench className="h-5 w-5 mr-2" />
                Worker Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {worker.profile.skills?.map((skill, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {skill}
                      </span>
                    )) || <span className="text-sm text-gray-500">No skills listed</span>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <p className="text-sm text-gray-900">{worker.profile.experienceYears || 0} years</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                  <p className="text-sm text-gray-900">PKR {worker.profile.hourlyRate || 0}/hour</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <p className="text-sm text-gray-900">{worker.profile.rating || 0}/5 ⭐</p>
                </div>
              </div>
              
              {worker.profile.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{worker.profile.description}</p>
                </div>
              )}
            </div>
          )}

          {/* CNIC Photos - Always show this section */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">CNIC Photos</h4>
            {user.profile.cnicPhotos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Front</label>
                  {user.profile.cnicPhotos.front ? (
                    <div className="relative">
                      <img 
                        src={user.profile.cnicPhotos.front} 
                        alt="CNIC Front" 
                        className="w-full h-48 object-contain rounded-lg border bg-gray-50"
                        onError={(e) => {
                          console.error('Error loading CNIC front image:', user.profile.cnicPhotos?.front);
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                      <div className="hidden w-full h-48 bg-gray-100 rounded-lg border items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-sm">Failed to load image</div>
                          <div className="text-xs mt-1">Click to try again</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-sm">No front image available</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Back</label>
                  {user.profile.cnicPhotos.back ? (
                    <div className="relative">
                      <img 
                        src={user.profile.cnicPhotos.back} 
                        alt="CNIC Back" 
                        className="w-full h-48 object-contain rounded-lg border bg-gray-50"
                        onError={(e) => {
                          console.error('Error loading CNIC back image:', user.profile.cnicPhotos?.back);
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                      <div className="hidden w-full h-48 bg-gray-100 rounded-lg border items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-sm">Failed to load image</div>
                          <div className="text-xs mt-1">Click to try again</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-sm">No back image available</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-sm">No CNIC photos uploaded</div>
                  <div className="text-xs mt-1">User has not uploaded CNIC documents</div>
                </div>
              </div>
            )}
            
            {/* Debug Information - Always visible */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-gray-700">
                <div className="font-semibold text-yellow-800 mb-2">🔍 Debug Information</div>
                <div className="space-y-1">
                  <div><strong>User ID:</strong> {user.uid}</div>
                  <div><strong>User Role:</strong> {user.role}</div>
                  <div><strong>CNIC Photos Object:</strong> {user.profile.cnicPhotos ? '✅ Present' : '❌ Missing'}</div>
                  {user.profile.cnicPhotos ? (
                    <>
                      <div><strong>Front URL:</strong> {user.profile.cnicPhotos.front || '❌ Missing'}</div>
                      <div><strong>Back URL:</strong> {user.profile.cnicPhotos.back || '❌ Missing'}</div>
                    </>
                  ) : (
                    <div className="text-red-600 font-medium">⚠️ No CNIC photos data found in user profile</div>
                  )}
                  <div><strong>Profile Keys:</strong> {Object.keys(user.profile).join(', ')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onApprove(user.uid)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve User
            </button>
            
            <button
              onClick={handleReject}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject User
            </button>
            
            <button
              onClick={handleSuspend}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Suspend User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
