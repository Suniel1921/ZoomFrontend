// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   FileText, 
//   LogOut, 
//   Calendar, 
//   Files,
//   Phone,
//   Mail,
//   Globe,
//   MapPin,
//   MessageCircle,
//   Headphones
// } from 'lucide-react';
// import Button from '../../components/Button';
// import EditProfileModal from './EditProfileModal';
// import TasksSection from './TasksSection';
// import AppointmentsSection from './AppointmentsSection';
// import DocumentsSection from './DocumentsSection';
// import ServiceRequestSection from './ServiceRequestSection';
// import ServiceRequestHistory from './ServiceRequestHistory';
// import { useAuthGlobally } from '../../context/AuthContext';
// import toast from 'react-hot-toast';


// export default function ClientPortal() {
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);  // No need for loading state anymore, as page is public
//   const [auth, setAuth] = useAuthGlobally();
//   const navigate = useNavigate();
  


//   // Simulate client data directly (or fetch it publicly)
//   const client = {
//     name: "John Doe",
//     email: "john.doe@example.com",
//     profilePhoto: null, // Example without profile photo
//     applications: [],
//     appointments: [],
//     documents: []
//   };

//   // If you want to simulate loading or fetching the data, you can use an effect for that
//   useEffect(() => {
//     setIsLoading(false);  // Set to false as we are no longer checking for authentication
//   }, []);

//   const handleLogout = () => {
//     toast.success('Logout successfully');
//     // If logout is required (can remove this functionality if not needed)
//     localStorage.removeItem('token');
//     navigate('/client-login')
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Top Navigation */}
//       <nav className="bg-brand-black text-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex">
//               <div className="flex-shrink-0 flex items-center">
//                  <img src="/logo2.png" alt="Cancel Icon" className=" h-[50px]  align-center" />
//                 {/* <FileText className="h-8 w-8 text-brand-yellow" /> */}
//                 {/* <span className="ml-2 text-xl font-semibold hidden sm:inline">Zoom Creatives</span> */}
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               {/* If you want to have profile photo or just initials */}
//               <button
//                 onClick={() => setIsProfileModalOpen(true)}
//                 className="flex items-center gap-2 hover:bg-brand-yellow/10 px-3 py-2 rounded-md transition-colors"
//                >
//                 {auth.user.profilePhoto ? (
//                   <img 
//                     src={auth.user.profilePhoto} 
//                     alt={auth.user.name}
//                     className="h-8 w-8 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="h-8 w-8 rounded-full bg-brand-yellow/10 flex items-center justify-center">
//                     <span className="text-brand-yellow font-medium">
//                       {client.name.split(' ').map(n => n[0]).join('')}
//                     </span>
//                   </div>
//                 )}
//                 <span className="text-sm text-gray-200 hidden sm:inline">{auth?.user?.fullName}</span>
//               </button>
//               <Button 
//                 variant="outline" 
//                 onClick={handleLogout} 
//                 className="!p-2 text-brand-yellow border-brand-yellow hover:bg-brand-yellow hover:text-brand-black"
//                 title="Sign Out"
//               >
//                 <LogOut className="h-5 w-5" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Tasks Section */}
//           <div className="lg:col-span-2 bg-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <FileText className="h-6 w-6 text-gray-400" />
//               <h2 className="text-xl font-semibold">Tasks at Zoom Creatives</h2>
//             </div>
//             {/* <TasksSection applications={client.applications} clientId={client.id} /> */}
//             <TasksSection />
//           </div>

//           {/* Appointments Section */}
//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <Calendar className="h-6 w-6 text-gray-400" />
//               <h2 className="text-xl font-semibold">Appointments</h2>
//             </div>
//             <AppointmentsSection appointments={client.appointments} />
//           </div>

//           {/* Documents Section */}
//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <Files className="h-6 w-6 text-gray-400" />
//               <h2 className="text-xl font-semibold">Documents</h2>
//             </div>
//             <DocumentsSection clientId={client.id} />
//           </div>
//         </div>

//         {/* Service Request Section */}
//         <div className="mt-6">
//           <ServiceRequestSection client={client} />
//         </div>

//         {/* Service Request History */}
//         <div className="mt-6">
//           <ServiceRequestHistory client={client} />
//         </div>

//         {/* Support and Contact Section */}
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Support Section */}
//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <Headphones className="h-6 w-6 text-gray-400" />
//               <h2 className="text-xl font-semibold">Support</h2>
//             </div>
//             <div className="space-y-4">
//               <p className="text-gray-600">
//                 If you encounter any problems while using this portal, please contact us{' '}.
//                 <a href="tel:090-6494-5723" className="text-brand-black hover:text-brand-yellow">
//                   090-6494-5723
//                 </a>
//                 . You can message us on WhatsApp or Viber too.
//               </p>
//             </div>

//             <div>
//             <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d103680.99060723219!2d139.72904699687305!3d35.70085582044349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x6018896804baff7d%3A0x41a6107aea0b6618!2z44Kw44Op44Oz44OJ44K544OG44O844K_44K5S0lZQTJGLCAxIENob21lLTExLTcgVGFpaGVpLCBTdW1pZGEgQ2l0eSwgVG9reW8gMTMwLTAwMTI!3m2!1d35.7008839!2d139.8114481!5e0!3m2!1sen!2sjp!4v1736155394129!5m2!1sen!2sjp" width="550" height="450"></iframe>
//             </div>
//           </div>

//           {/* Contact Details */}
//           <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <MessageCircle className="h-6 w-6 text-gray-400" />
//               <h2 className="text-xl font-semibold">Contact Details</h2>
//             </div>
//             <div className="space-y-6">
//               <div>
//                 <h3 className="font-medium text-lg mb-2">Zoom Creatives Inc.</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500 mb-1">Address in Japanese</h4>
//                     <p className="flex items-start gap-2">
//                       <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
//                       <span>
//                         〒130-0012<br />
//                         東京都墨田区太平1-11-7<br />
//                         グランドステータスKIYA2F
//                       </span>
//                     </p>
//                   </div>

//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500 mb-1">Address in English</h4>
//                     <p className="text-gray-600">
//                       Tokyo-To, Sumida-Ku,<br />
//                       Taihei 1-11-7 Grand Status KIYA 2F, 130-0012
//                     </p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Numbers</h4>
//                     <div className="space-y-1">
//                       <p className="flex items-center gap-2">
//                         <Phone className="h-4 w-4 text-gray-400" />
//                         <a href="tel:03-6764-5723" className="text-brand-black hover:text-brand-yellow">
//                           03-6764-5723
//                         </a>
//                       </p>
//                       <p className="flex items-center gap-2">
//                         <Phone className="h-4 w-4 text-gray-400" />
//                         <a href="tel:090-6494-5723" className="text-brand-black hover:text-brand-yellow">
//                           090-6494-5723
//                         </a>
//                       </p>
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500 mb-1">Email & Website</h4>
//                     <div className="space-y-1">
//                       <p className="flex items-center gap-2">
//                         <Mail className="h-4 w-4 text-gray-400" />
//                         <a href="mailto:zoomcreatives.jp@gmail.com" className="text-brand-black hover:text-brand-yellow break-all">
//                           zoomcreatives.jp@gmail.com
//                         </a>
//                       </p>
//                       <p className="flex items-center gap-2">
//                         <Globe className="h-4 w-4 text-gray-400" />
//                         <a href="https://www.zoomcreatives.jp" target="_blank" rel="noopener noreferrer" className="text-brand-black hover:text-brand-yellow">
//                           www.zoomcreatives.jp
//                         </a>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div> 
//         </div>
//       </main>
    

//          {/* Profile Edit Modal */}
//          <EditProfileModal
//         isVisible={isProfileModalOpen}
//         onClose={() => setIsProfileModalOpen(false)}
//       />

//       {/* Footer */}
//       <footer className="bg-brand-black text-white mt-12 py-4">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <p className="text-sm">
//             © {new Date().getFullYear()} Zoom Creatives. All Rights Reserved.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }





// ******new layout********

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  LogOut, 
  Calendar, 
  Files,
  Phone,
  Mail,
  Globe,
  MapPin,
  MessageCircle,
  Headphones,
  Menu, // Added for mobile menu
  X // Added for close button
} from 'lucide-react';
import Button from '../../components/Button';
import EditProfileModal from './EditProfileModal';
import TasksSection from './TasksSection';
import AppointmentsSection from './AppointmentsSection';
import DocumentsSection from './DocumentsSection';
import ServiceRequestSection from './ServiceRequestSection';
import ServiceRequestHistory from './ServiceRequestHistory';
import { useAuthGlobally } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ClientPortal() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auth, setAuth] = useAuthGlobally();
  const navigate = useNavigate();

  const client = {
    name: "John Doe",
    email: "john.doe@example.com",
    profilePhoto: null,
    applications: [],
    appointments: [],
    documents: []
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    toast.success('Logout successfully');
    localStorage.removeItem('token');
    navigate('/client-login')
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-brand-black text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src="/logo2.png" alt="Logo" className="h-[40px] sm:h-[50px]" />
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 hover:bg-brand-yellow/10 px-3 py-2 rounded-md transition-colors"
              >
                {auth.user.profilePhoto ? (
                  <img 
                    src={auth.user.profilePhoto} 
                    alt={auth.user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                    <span className="text-brand-yellow font-medium">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-200">{auth?.user?.fullName}</span>
              </button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="!p-2 text-brand-yellow border-brand-yellow hover:bg-brand-yellow hover:text-brand-black"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-brand-black border-t border-gray-700 p-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-brand-yellow/10"
              >
                {auth.user.profilePhoto ? (
                  <img 
                    src={auth.user.profilePhoto} 
                    alt={auth.user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                    <span className="text-brand-yellow font-medium">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-200">{auth?.user?.fullName}</span>
              </button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="w-full justify-center text-brand-yellow border-brand-yellow hover:bg-brand-yellow hover:text-brand-black"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2 bg-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Tasks at Zoom Creatives</h2>
            </div>
            <TasksSection />
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Appointments</h2>
            </div>
            <AppointmentsSection appointments={client.appointments} />
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Files className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Documents</h2>
            </div>
            <DocumentsSection clientId={client.id} />
          </div>
        </div>

        {/* Service Request Section */}
        <div className="mt-4 sm:mt-6">
          <ServiceRequestSection client={client} />
        </div>

        {/* Service Request History */}
        <div className="mt-4 sm:mt-6">
          <ServiceRequestHistory client={client} />
        </div>

        {/* Support and Contact Section */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Support Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Support</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm sm:text-base">
                If you encounter any problems while using this portal, please contact us{' '}
                <a href="tel:090-6494-5723" className="text-brand-black hover:text-brand-yellow">
                  090-6494-5723
                </a>
                . You can message us on WhatsApp or Viber too.
              </p>
            </div>

            <div className="mt-4 w-full overflow-hidden rounded-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d103680.99060723219!2d139.72904699687305!3d35.70085582044349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x6018896804baff7d%3A0x41a6107aea0b6618!2z44Kw44Op44Oz44OJ44K544OG44O844K_44K5S0lZQTJGLCAxIENob21lLTExLTcgVGFpaGVpLCBTdW1pZGEgQ2l0eSwgVG9reW8gMTMwLTAwMTI!3m2!1d35.7008839!2d139.8114481!5e0!3m2!1sen!2sjp!4v1736155394129!5m2!1sen!2sjp" 
                className="w-full h-[300px] sm:h-[450px]"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Contact Details</h2>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-medium text-base sm:text-lg mb-2">Zoom Creatives Inc.</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Address in Japanese</h4>
                    <p className="flex items-start gap-2 text-sm sm:text-base">
                      <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                      <span>
                        〒130-0012<br />
                        東京都墨田区太平1-11-7<br />
                        グランドステータスKIYA2F
                      </span>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Address in English</h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Tokyo-To, Sumida-Ku,<br />
                      Taihei 1-11-7 Grand Status KIYA 2F, 130-0012
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Contact Numbers</h4>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href="tel:03-6764-5723" className="text-brand-black hover:text-brand-yellow text-sm sm:text-base">
                          03-6764-5723
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href="tel:090-6494-5723" className="text-brand-black hover:text-brand-yellow text-sm sm:text-base">
                          090-6494-5723
                        </a>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Email & Website</h4>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href="mailto:zoomcreatives.jp@gmail.com" className="text-brand-black hover:text-brand-yellow break-all text-sm sm:text-base">
                          zoomcreatives.jp@gmail.com
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href="https://www.zoomcreatives.jp" target="_blank" rel="noopener noreferrer" className="text-brand-black hover:text-brand-yellow text-sm sm:text-base">
                          www.zoomcreatives.jp
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> 
        </div>
      </main>

      {/* Profile Edit Modal */}
      <EditProfileModal
        isVisible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-brand-black text-white mt-8 sm:mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm">
            © {new Date().getFullYear()} Zoom Creatives. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}