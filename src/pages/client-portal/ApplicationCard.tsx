import { Clock, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { Application } from '../../types';

interface ApplicationCardProps {
  application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">{application.type}</h3>
          <p className="text-sm text-gray-600">{application.country}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          application.visaStatus === 'Approved' ? 'bg-green-100 text-green-700' :
          application.visaStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {application.visaStatus}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Application Deadline</p>
            <p className="text-sm font-medium">
              {format(new Date(application.deadline), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Family Members</p>
            <p className="text-sm font-medium">
              {application.familyMembers.length} included
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-sm font-medium">
              ¥{application.payment.total.toLocaleString()}
            </p>
            <div className="text-xs text-gray-500">
              <p>Application Fee: ¥{application.payment.visaApplicationFee.toLocaleString()}</p>
              <p>Translation Fee: ¥{application.payment.translationFee.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}