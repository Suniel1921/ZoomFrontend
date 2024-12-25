// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { X } from 'lucide-react';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import SearchableSelect from '../../components/SearchableSelect';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { countries } from '../../utils/countries';
// import axios from 'axios';
// import TodoList from '../../components/TodoList';
// import FamilyMembersList from './components/FamilyMembersList';
// import PaymentDetails from './components/PaymentDetails';
// import type { FamilyMember } from '../../types';
// import toast from 'react-hot-toast';

// const applicationSchema = z.object({
//   clientId: z.string().min(1, 'Client is required'),
//   type: z.enum(['Visitor Visa', 'Student Visa']),
//   country: z.string().min(1, 'Country is required'),
//   documentStatus: z.enum(['Not Yet', 'Few Received', 'Fully Received']),
//   documentsToTranslate: z.number().min(0),
//   translationStatus: z.enum(['Under Process', 'Completed']),
//   visaStatus: z.enum([
//     'Under Review',
//     'Under Process',
//     'Waiting for Payment',
//     'Completed',
//     'Approved',
//     'Rejected',
//   ]),
//   deadline: z.date(),
//   payment: z.object({
//     visaApplicationFee: z.number().min(0),
//     translationFee: z.number().min(0),
//     paidAmount: z.number().min(0),
//     discount: z.number().min(0),
//   }),
//   paymentStatus: z.enum(['Due', 'Paid']).optional(),
//   notes: z.string().optional(),
//   todos: z
//     .array(
//       z.object({
//         id: z.string(),
//         task: z.string(),
//         completed: z.boolean(),
//         priority: z.enum(['Low', 'Medium', 'High']),
//         dueDate: z.date().optional(),
//       })
//     )
//     .default([]),
//   handledBy: z.string().min(1, 'Visa Application Handler is required'),
//   translationHandler: z.string().min(1, 'Document Translation Handler is required'),
//   step: z.string().min(1, 'Step is required'),
// });

// type ApplicationFormData = z.infer<typeof applicationSchema>;

// interface AddApplicationModalProps {
//   isOpen: boolean;
//   getAllApplication: () => void;
//   onClose: () => void;
// }

// export default function AddApplicationModal({
//   isOpen,
//   onClose,
//   getAllApplication,
// }: AddApplicationModalProps) {
//   const [clients, setClients] = useState<any[]>([]);
//   const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
//   const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);
//   const [applicationStep, setApplicationStep] = useState<[]>([]);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<ApplicationFormData>({
//     resolver: zodResolver(applicationSchema),
//     defaultValues: {
//       documentStatus: 'Not Yet',
//       documentsToTranslate: 0,
//       translationStatus: 'Under Process',
//       visaStatus: 'Under Review',
//       deadline: new Date(),
//       payment: {
//         visaApplicationFee: 0,
//         translationFee: 0,
//         paidAmount: 0,
//         discount: 0,
//       },
//       todos: [],
//     },
//   });

//   useEffect(() => {
//     if (isOpen) {
//       axios
//         .get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
//         .then((response) => {
//           if (Array.isArray(response.data)) {
//             setClients(response.data);
//           } else {
//             console.error('Expected an array, received:', response.data);
//             setClients([]);
//           }
//         })
//         .catch((error) => {
//           console.error('Error fetching clients:', error);
//           setClients([]);
//         });
//     }
//   }, [isOpen]);

//   // Fetch the handlers (admins) from the API
//   useEffect(() => {
//     const fetchHandlers = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`);
//         setHandlers(response.data.admins); // Assuming the response has an array of handlers
//       } catch (error) {
//         console.error('Failed to fetch handlers:', error);
//       }
//     };

//     fetchHandlers();
//   }, []);

//     // Fetch the application step ID
//     useEffect(() => {
//       const fetchApplicationStep = async () => {
//         try {
//           const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getApplicationStep`);
//           setApplicationStep(response.data.applicationStep); // Assuming the response has an array of handlers
//         } catch (error) {
//           console.error('Failed to fetch handlers:', error);
//         }
//       };

//       fetchApplicationStep();
//     }, []);

//   const onSubmit = async (data: ApplicationFormData) => {
//     try {
//       const client = clients.find((c) => c._id === data.clientId);
//       if (!client) {
//         toast.error('Client not found');
//         return;
//       }

//       const total =
//         data.payment.visaApplicationFee +
//         data.payment.translationFee -
//         (data.payment.paidAmount + data.payment.discount);

//       const payload = {
//         ...data,
//         clientName: client.name,
//         familyMembers,
//         submissionDate: new Date().toISOString(),
//         payment: { ...data.payment, total },
//         paymentStatus: total <= 0 ? 'Paid' : 'Due',
//       };

//       const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/visaApplication/createVisaApplication`, payload);
//       if (response.data.success) {
//         toast.success(response.data.message);
//         reset();
//         setFamilyMembers([]);
//         onClose();
//         getAllApplication();
//       }
//     } catch (error: any) {
//       console.error('Error submitting application:', error);
//       if (error.response) {
//         toast.error(error.response.data.message);
//       }
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">New Application</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//           {/* Client Information */}
//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Client Information</h3>
//             <SearchableSelect
//               options={clients.map((client) => ({
//                 value: client._id,
//                 label: client.name,
//               }))}
//               value={watch('clientId')}
//               onChange={(value) => setValue('clientId', value)}
//               placeholder="Select client"
//               error={errors.clientId?.message}
//             />
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <select {...register('country')} className="form-select">
//                 <option value="">Select country</option>
//                 {countries.map((c) => (
//                   <option key={c.code} value={c.name}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               <select {...register('type')} className="form-select">
//                 <option value="Visitor Visa">Visitor Visa</option>
//                 <option value="Student Visa">Student Visa</option>
//               </select>
//             </div>
//           </div>

//           {/* application step section */}
// <div>
// <select {...register('step', { required: 'This field is required' })}>
//     <option value="">Select Step ID</option>
//     <option value={applicationStep._id}>{applicationStep._id}</option>
//   </select>
// </div>

//           {/* Document Handling Section */}
//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Document Handling</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Visa Application Handled By */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Visa Application Handled By</label>
//                 <select
//                   {...register('handledBy', { required: 'This field is required' })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="">Select handler</option>
//                   {handlers.map((handler) => (
//                     <option key={handler.id} value={handler.name}>
//                       {handler.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.handledBy && (
//                   <p className="mt-1 text-sm text-red-600">{errors.handledBy.message}</p>
//                 )}
//               </div>

//               {/* Document Translation Handled By */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Document Translation Handled By</label>
//                 <select
//                   {...register('translationHandler', { required: 'This field is required' })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="">Select handler</option>
//                   {handlers.map((handler) => (
//                     <option key={handler.id} value={handler.name}>
//                       {handler.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.translationHandler && (
//                   <p className="mt-1 text-sm text-red-600">{errors.translationHandler.message}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Payment Details */}
//           <PaymentDetails
//             register={register}
//             watch={watch}
//             setValue={setValue}
//             errors={errors}
//           />

//           {/* Submit */}
//           <div className="flex justify-end gap-2">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary">Submit</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }















import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { countries } from "../../utils/countries";
import axios from "axios";
import TodoList from "../../components/TodoList";
import FamilyMembersList from "./components/FamilyMembersList";
import PaymentDetails from "./components/PaymentDetails";
import type { FamilyMember } from "../../types";
import toast from "react-hot-toast";

// Validation schema for the application form
const applicationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  type: z.enum(["Visitor Visa", "Student Visa"]),
  country: z.string().min(1, "Country is required"),
  documentStatus: z.enum(["Not Yet", "Few Received", "Fully Received"]),
  documentsToTranslate: z.number().min(0),
  translationStatus: z.enum(["Under Process", "Completed"]),
  visaStatus: z.enum([
    "Under Review",
    "Under Process",
    "Waiting for Payment",
    "Completed",
    "Approved",
    "Rejected",
  ]),
  deadline: z.date(),
  payment: z.object({
    visaApplicationFee: z.number().min(0),
    translationFee: z.number().min(0),
    paidAmount: z.number().min(0),
    discount: z.number().min(0),
  }),
  paymentStatus: z.enum(["Due", "Paid"]).optional(),
  notes: z.string().optional(),
  todos: z
    .array(
      z.object({
        id: z.string(),
        task: z.string(),
        completed: z.boolean(),
        priority: z.enum(["Low", "Medium", "High"]),
        dueDate: z.date().optional(),
      })
    )
    .default([]),
  handledBy: z.string().min(1, "Visa Application Handler is required"),
  translationHandler: z
    .string()
    .min(1, "Document Translation Handler is required"),
  // step: z.string().min(1, "Step is required"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface AddApplicationModalProps {
  isOpen: boolean;
  getAllApplication: () => void;
  onClose: () => void;
}

export default function AddApplicationModal({
  isOpen,
  onClose,
  getAllApplication,
}: AddApplicationModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);
  const [applicationStep, setApplicationStep] = useState<any[]>([]);


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      documentStatus: "Not Yet",
      documentsToTranslate: 0,
      translationStatus: "Under Process",
      visaStatus: "Under Review",
      deadline: new Date(),
      payment: {
        visaApplicationFee: 0,
        translationFee: 0,
        paidAmount: 0,
        discount: 0,
      },
      todos: [],
    },
  });



  

  const handleFamilyMembersChange = (updatedMembers) => {
    setFamilyMembers(updatedMembers);
  };

  //get all clients list in drop down 
  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
        .then((response) => {
          const clientsData = response?.data?.clients;
          setClients(Array.isArray(clientsData) ? clientsData : [clientsData]); 
        })
        .catch((error) => {
          console.error("Error fetching clients:", error);
          setClients([]); // Set clients to an empty array in case of error
        });
    }
  }, [isOpen]);

  // Fetch the handlers (admins) from the API
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins); // Assuming the response has an array of handlers
      } catch (error) {
        console.error("Failed to fetch handlers:", error);
      }
    };

    fetchHandlers();
  }, []);

  // const onSubmit = async (data: ApplicationFormData) => {
  //   try {
  //     const client = clients.find((c) => c._id === data.clientId);
  //     if (!client) {
  //       toast.error("Client not found");
  //       return;
  //     }

  //     const total =
  //       data.payment.visaApplicationFee +
  //       data.payment.translationFee -
  //       (data.payment.paidAmount + data.payment.discount);

  //     const payload = {
  //       ...data,
  //       clientName: client.name,
  //       familyMembers,
  //       submissionDate: new Date().toISOString(),
  //       payment: { ...data.payment, total },
  //       paymentStatus: total <= 0 ? "Paid" : "Due",
  //     };

  //     const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/visaApplication/createVisaApplication`, payload);
  //     if (response.data.success) {
  //       toast.success(response.data.message);
  //       reset();
  //       setFamilyMembers([]);
  //       onClose();
  //       getAllApplication();
  //     }
  //   } catch (error: any) {
  //     console.error("Error submitting application:", error);
  //     if (error.response) {
  //       toast.error(error.response.data.message);
  //     }
  //   }
  // };




  const onSubmit = async (data: ApplicationFormData) => {
    try {
      const client = clients.find((c) => c._id === data.clientId);
      if (!client) {
        toast.error("Client not found");
        return;
      }
  
      const total =
        data.payment.visaApplicationFee +
        data.payment.translationFee -
        (data.payment.paidAmount + data.payment.discount);
  
      const payload = {
        ...data,
        clientName: client.name,
        familyMembers, // Ensure family members are sent as part of the payload
        submissionDate: new Date().toISOString(),
        payment: { ...data.payment, total },
        paymentStatus: total <= 0 ? "Paid" : "Due",
      };
  
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/visaApplication/createVisaApplication`, payload);
      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        setFamilyMembers([]); // Reset family members after submission
        onClose();
        getAllApplication();
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      if (error.response) {
        toast.error(error.response.data.message);
      }
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Application</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Client Information</h3>
            <SearchableSelect
              options={clients.map((client) => ({
                value: client._id,
                label: client.name,
              }))}
              value={watch("clientId")}
              onChange={(value) => setValue("clientId", value)}
              placeholder="Select client"
              error={errors.clientId?.message}
              className="mb-4" // Added margin bottom for spacing
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                {...register("country")}
                className="form-select p-2 mt-1 rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow mb-4"
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                {...register("type")}
                className="form-select p-2 mt-1 rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow mb-4"
              >
                <option value="Visitor Visa">Visitor Visa</option>
                <option value="Student Visa">Student Visa</option>
              </select>
            </div>
          </div>

          {/* application deadline */}
          <div>
              <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
              <DatePicker
                selected={watch('deadline')}
                onChange={(date) => setValue('deadline', date as Date)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                dateFormat="yyyy-MM-dd"
              />
            </div>


            {/* document status  */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Status</label>
              <select
                {...register('documentStatus')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="Not Yet">Not Yet</option>
                <option value="Few Received">Few Received</option>
                <option value="Fully Received">Fully Received</option>
              </select>
            </div>


            {/* visa status  */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Visa Status</label>
              <select
                {...register('visaStatus')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="Under Review">Under Review</option>
                <option value="Under Process">Under Process</option>
                <option value="Waiting for Payment">Waiting for Payment</option>
                <option value="Completed">Completed</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

          {/* document to translate */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Documents to Translate</label>
              <Input
                type="number"
                {...register('documentsToTranslate', { valueAsNumber: true })}
                className="mt-1"
                min="0"
              />
            </div>


          {/* Document Handling Section */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Document Handling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visa Application Handled By */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Visa Application Handled By
                </label>
                <select
                  {...register("handledBy", {
                    required: "This field is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="">Select handler</option>
                  {handlers.map((handler) => (
                    <option key={handler.id} value={handler.id}>
                      {handler.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Translation Handler */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Translation Handled By
                </label>
                <select
                  {...register("translationHandler", {
                    required: "This field is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="">Select handler</option>
                  {handlers.map((handler) => (
                    <option key={handler.id} value={handler.id}>
                      {handler.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Payment Details</h3>
            <PaymentDetails
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
          </div>

          {/* Family Members Section */}
          <FamilyMembersList
        familyMembers={familyMembers}
        onFamilyMembersChange={handleFamilyMembersChange}
      />


            {/* To-Do List Section */}
                    <div className="space-y-4">
                      <h3 className="font-medium">To-Do List</h3>
                      <TodoList
                        todos={watch("todos") || []}
                        onTodosChange={(newTodos) => setValue("todos", newTodos)}
                      />
                    </div>
          
                    {/* Notes Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        {...register("notes")}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                        placeholder="Add any additional notes..."
                      />
                    </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}






