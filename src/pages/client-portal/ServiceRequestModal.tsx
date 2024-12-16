// import { useState } from 'react';
// import { X } from 'lucide-react';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import { useServiceRequestStore } from '../../store/serviceRequestStore';

// interface ServiceRequestModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   service: {
//     id: string;
//     title: string;
//   };
//   client: {
//     id: string;
//     name: string;
//     phone: string;
//   };
// }

// export default function ServiceRequestModal({
//   isOpen,
//   onClose,
//   service,
//   client,
// }: ServiceRequestModalProps) {
//   const { addRequest } = useServiceRequestStore();
//   const [message, setMessage] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!message.trim()) {
//       setError('Please provide a message with your request');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       addRequest({
//         clientId: client.id,
//         clientName: client.name,
//         phoneNumber: client.phone,
//         serviceId: service.id,
//         serviceName: service.title,
//         message: message.trim(),
//       });

//       onClose();
//     } catch (error) {
//       console.error('Failed to submit request:', error);
//       setError('Failed to submit request. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Request Service</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Service</label>
//             <Input value={service.title} disabled className="mt-1 bg-gray-50" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Your Name</label>
//             <Input value={client.name} disabled className="mt-1 bg-gray-50" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//             <Input value={client.phone} disabled className="mt-1 bg-gray-50" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Message <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               rows={4}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               placeholder="Please describe your requirements or questions..."
//               required
//             />
//             {error && (
//               <p className="mt-1 text-sm text-red-600">{error}</p>
//             )}
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting || !message.trim()}>
//               {isSubmitting ? 'Submitting...' : 'Submit Request'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }





import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    title: string;
  };
  client: {
    id: string;
    name: string;
    phone: string;
  };
}

export default function ServiceRequestModal({
  isOpen,
  onClose,
  service,
  client,
}: ServiceRequestModalProps) {
  const [serviceName, setServiceName] = useState('');
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('Please provide a message with your request');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/createServiceRequest`, {
        clientId: client.id,
        clientName: clientName.trim(),
        phoneNumber: phoneNumber.trim(),
        serviceId: service.id,
        serviceName: serviceName.trim(),
        message: message.trim(),
      });

      toast.success('Service request submitted successfully!');
      setServiceName('');
      setClientName('');
      setPhoneNumber('');
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Failed to submit request:', err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Request Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service</label>
            <Input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="mt-1"
              placeholder="Enter service name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              placeholder="Please describe your requirements or questions..."
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
