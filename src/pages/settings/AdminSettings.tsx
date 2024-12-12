// import { useState } from 'react';
// import { Users, Plus, Shield, Trash2, Edit } from 'lucide-react';
// import Button from '../../components/Button';
// import { useAdminStore } from '../../store/adminStore';
// import AddAdminModal from './components/AddAdminModal';
// import EditAdminModal from './components/EditAdminModal';
// import PermissionsModal from './components/PermissionsModal';
// import type { Admin } from '../../types/admin';

// export default function AdminSettings() {
//   const { currentAdmin, admins, deleteAdmin } = useAdminStore();
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
//   const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

//   const handleDelete = (admin: Admin) => {
//     if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
//       deleteAdmin(admin.id);
//     }
//   };

//   if (currentAdmin?.role !== 'super_admin') {
//     return (
//       <div className="text-center py-8">
//         <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900">Access Restricted</h3>
//         <p className="mt-2 text-sm text-gray-500">
//           Only super administrators can access this section.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-medium leading-6 text-gray-900">
//           Admin Management
//         </h3>
//         <Button onClick={() => setIsAddModalOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Admin
//         </Button>
//       </div>

//       <div className="bg-white shadow-sm rounded-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Admin
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Role
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Last Login
//               </th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {admins.map((admin) => (
//               <tr key={admin.id}>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 h-10 w-10 bg-brand-yellow/10 rounded-full flex items-center justify-center">
//                       <span className="text-brand-black font-medium">
//                         {admin.name[0]}
//                       </span>
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {admin.name}
//                       </div>
//                       <div className="text-sm text-gray-500">{admin.email}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-yellow/10 text-brand-black">
//                     {admin.role}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                     admin.status === 'active'
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {admin.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {admin.lastLogin
//                     ? new Date(admin.lastLogin).toLocaleString()
//                     : 'Never'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                   <div className="flex justify-end gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedAdmin(admin);
//                         setIsPermissionsModalOpen(true);
//                       }}
//                     >
//                       <Shield className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedAdmin(admin);
//                         setIsEditModalOpen(true);
//                       }}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     {admin.role !== 'super_admin' && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDelete(admin)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <AddAdminModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />

//       {selectedAdmin && (
//         <>
//           <EditAdminModal
//             isOpen={isEditModalOpen}
//             onClose={() => {
//               setIsEditModalOpen(false);
//               setSelectedAdmin(null);
//             }}
//             admin={selectedAdmin}
//           />

//           <PermissionsModal
//             isOpen={isPermissionsModalOpen}
//             onClose={() => {
//               setIsPermissionsModalOpen(false);
//               setSelectedAdmin(null);
//             }}
//             admin={selectedAdmin}
//           />
//         </>
//       )}
//     </div>
//   );
// }




// **********************NEW CODE***********************



// import { useEffect, useState } from 'react';
// import { Users, Plus, Shield, Trash2, Edit } from 'lucide-react';
// import Button from '../../components/Button';
// import { useAdminStore } from '../../store/adminStore';
// import AddAdminModal from './components/AddAdminModal';
// import EditAdminModal from './components/EditAdminModal';
// import PermissionsModal from './components/PermissionsModal';
// import type { Admin } from '../../types/admin';
// import toast from 'react-hot-toast';
// import axios from 'axios';

// export default function AdminSettings() {
//   // const { admins, deleteAdmin } = useAdminStore();
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
//   const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
//   const [admins, setAdmins] = useState ([]);





//   const getAllAdmin = async ()=>{
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`);
//       if(response.data.success){
//         setAdmins(response.data.admin)
//         toast.success(response.data.message);
//       }
      
//     } catch (error:any) {
//       if(error.response){
//         toast.error(error.response.data.message);
//       }
      
//     }
//   }

//   useEffect(()=>{
//     getAllAdmin();
//   },[])




//   const handleDelete = (admin: Admin) => {
//     if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
//       deleteAdmin(admin.id);
//     }
//   };








//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-medium leading-6 text-gray-900">
//           Admin Management
//         </h3>
//         <Button onClick={() => setIsAddModalOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Admin
//         </Button>
//       </div>

//       <div className="bg-white shadow-sm rounded-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Admin
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Role
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Last Login
//               </th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {admins.map((admin) => (
//               <tr key={admin.id}>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 h-10 w-10 bg-brand-yellow/10 rounded-full flex items-center justify-center">
//                       <span className="text-brand-black font-medium">
//                         {admin.name[0]}
//                       </span>
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {admin.name}
//                       </div>
//                       <div className="text-sm text-gray-500">{admin.email}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-yellow/10 text-brand-black">
//                     {admin.role}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                     admin.status === 'active'
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {admin.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {admin.lastLogin
//                     ? new Date(admin.lastLogin).toLocaleString()
//                     : 'Never'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                   <div className="flex justify-end gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedAdmin(admin);
//                         setIsPermissionsModalOpen(true);
//                       }}
//                     >
//                       <Shield className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedAdmin(admin);
//                         setIsEditModalOpen(true);
//                       }}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     {admin.role !== 'super_admin' && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDelete(admin)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <AddAdminModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />

//       {selectedAdmin && (
//         <>
//           <EditAdminModal
//             isOpen={isEditModalOpen}
//             onClose={() => {
//               setIsEditModalOpen(false);
//               setSelectedAdmin(null);
//             }}
//             admin={selectedAdmin}
//           />

//           <PermissionsModal
//             isOpen={isPermissionsModalOpen}
//             onClose={() => {
//               setIsPermissionsModalOpen(false);
//               setSelectedAdmin(null);
//             }}
//             admin={selectedAdmin}
//           />
//         </>
//       )}
//     </div>
//   );
// }






import { useState, useEffect } from 'react';
import { Users, Plus, Shield, Trash2, Edit } from 'lucide-react';
import Button from '../../components/Button';
import { useAdminStore } from '../../store/adminStore';
import AddAdminModal from './components/AddAdminModal';
import EditAdminModal from './components/EditAdminModal';
import PermissionsModal from './components/PermissionsModal';
import toast from 'react-hot-toast';
import axios from 'axios';
import type { Admin } from '../../types/admin';

export default function AdminSettings() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`);
      setAdmins(response.data.admins); // Assuming response.data is the list of admins
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch admins.');
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/deleteAdmin/${admin._id}`);
        toast.success('Admin deleted successfully.');
        // setAdmins((prev) => prev.filter((item) => item.id !== admin.id)); // Optimistic UI update
        fetchAdmins();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete admin.');
      }
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Admin Management</h3>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-brand-yellow/10 rounded-full flex items-center justify-center">
                      <span className="text-brand-black font-medium">{admin.name[0]}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-yellow/10 text-brand-black">
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {admin.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsPermissionsModalOpen(true);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {admin.role !== 'super_admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(admin)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} fetchAdmins={fetchAdmins} />

      {selectedAdmin && (
        <>
          <EditAdminModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAdmin(null);
            }}
            admin={selectedAdmin}
            fetchAdmins = {fetchAdmins}
          />

          <PermissionsModal
            isOpen={isPermissionsModalOpen}
            onClose={() => {
              setIsPermissionsModalOpen(false);
              setSelectedAdmin(null);
            }}
            admin={selectedAdmin}
          />
        </>
      )}
    </div>
  );
}
