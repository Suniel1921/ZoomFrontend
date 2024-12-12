import { FileCheck } from 'lucide-react';
import type { Application } from '../../types';

interface ApplicationsSectionProps {
  applications: Application[];
}

export default function ApplicationsSection({ applications }: ApplicationsSectionProps) {
  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <p className="text-gray-500 text-center">No applications found.</p>
      ) : (
        applications.map((app) => (
          <div key={app.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{app.type} - {app.country}</h3>
                <p className="text-sm text-gray-500">
                  Deadline: {new Date(app.deadline).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                app.visaStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                app.visaStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {app.visaStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Translation Status</p>
                <p className="font-medium">{app.translationStatus}</p>
              </div>
              <div>
                <p className="text-gray-500">Documents</p>
                <p className="font-medium">{app.documentStatus}</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Payment Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Application Fee:</p>
                    <p>¥{app.payment.visaApplicationFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Translation Fee:</p>
                    <p>¥{app.payment.translationFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount:</p>
                    <p className="font-medium">¥{app.payment.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status:</p>
                    <p className="font-medium">{app.paymentStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}