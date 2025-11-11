import { User, Worker } from '../types';
import { Eye, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface UserCardProps {
  user: User;
  onView: (user: User) => void;
  onApprove: (userId: string) => void;
  onReject: (user: User) => void;
  showActions?: boolean;
}

export default function UserCard({ user, onView, onApprove, onReject, showActions = true }: UserCardProps) {
  const isWorker = user.role === 'worker';
  const worker = isWorker ? user as Worker : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user.profile.fullName}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">{user.phoneNumber}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === 'worker' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
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
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onView(user)}
              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {user.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(user.uid)}
                  className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onReject(user)}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  title="Reject"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Address:</span> {user.profile.address}
        </div>
        {user.profile.cnic && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">CNIC:</span> {user.profile.cnic}
          </div>
        )}
        {user.profile.cnicPhotos && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">CNIC Photos:</span>
            <div className="flex space-x-2 mt-1">
              <div className="relative">
                <img 
                  src={user.profile.cnicPhotos.front} 
                  alt="CNIC Front" 
                  className="w-20 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(user.profile.cnicPhotos.front, '_blank')}
                  title="Click to view full size"
                />
                <span className="absolute -bottom-1 left-0 right-0 text-xs text-center bg-black bg-opacity-75 text-white rounded-b">Front</span>
              </div>
              <div className="relative">
                <img 
                  src={user.profile.cnicPhotos.back} 
                  alt="CNIC Back" 
                  className="w-20 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(user.profile.cnicPhotos.back, '_blank')}
                  title="Click to view full size"
                />
                <span className="absolute -bottom-1 left-0 right-0 text-xs text-center bg-black bg-opacity-75 text-white rounded-b">Back</span>
              </div>
            </div>
          </div>
        )}
        {isWorker && worker?.profile.skills && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Skills:</span> {worker.profile.skills.join(', ')}
          </div>
        )}
        <div className="text-sm text-gray-500">
          Registered: {format(new Date(user.createdAt), 'MMM dd, yyyy')}
        </div>
      </div>
    </div>
  );
}
