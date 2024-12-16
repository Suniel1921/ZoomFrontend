// import { createContext, useContext, useState, useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import ClientLogin from './pages/ClientLogin';
// import ForgotPassword from './pages/ForgotPassword';
// import Dashboard from './pages/Dashboard';
// import ClientPortal from './pages/client-portal';
// import { addAuditLog } from './store/auditLogStore';
// import { Toaster } from 'react-hot-toast';

// interface AuthContextType {
//   userType: 'admin' | 'client' | null;
//   userEmail: string | null;
//   login: (type: 'admin' | 'client', email: string) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType>({
//   userType: null,
//   userEmail: null,
//   login: () => {},
//   logout: () => {},
// });

// export const useAuth = () => useContext(AuthContext);

// export default function App() {
//   const [userType, setUserType] = useState<'admin' | 'client' | null>(() => {
//     const savedType = localStorage.getItem('userType');
//     return (savedType === 'admin' || savedType === 'client') ? savedType : null;
//   });

//   const [userEmail, setUserEmail] = useState<string | null>(() => {
//     return localStorage.getItem('userEmail');
//   });

//   useEffect(() => {
//     if (userType && userEmail) {
//       localStorage.setItem('userType', userType);
//       localStorage.setItem('userEmail', userEmail);
//     } else {
//       localStorage.removeItem('userType');
//       localStorage.removeItem('userEmail');
//     }
//   }, [userType, userEmail]);

//   const login = (type: 'admin' | 'client', email: string) => {
//     setUserType(type);
//     setUserEmail(email);
//   };

//   const logout = () => {
//     if (userType && userEmail) {
//       addAuditLog({
//         userId: userEmail,
//         userName: userEmail,
//         userType: userType === 'admin' ? 'admin' : 'client',
//         action: 'logout',
//         resource: 'auth',
//         details: 'User logged out',
//         ipAddress: '127.0.0.1',
//         userAgent: navigator.userAgent
//       });
//     }
//     setUserType(null);
//     setUserEmail(null);
//     localStorage.removeItem('userType');
//     localStorage.removeItem('userEmail');
//   };

//   return (
//     <>
//     <AuthContext.Provider value={{ userType, userEmail, login, logout }}>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={
//           userType ? (
//             <Navigate to={userType === 'admin' ? "/dashboard" : "/client-portal"} replace />
//           ) : (
//             <Login />
//           )
//         } />
//         <Route path="/client-login" element={
//           userType ? (
//             <Navigate to={userType === 'client' ? "/client-portal" : "/dashboard"} replace />
//           ) : (
//             <ClientLogin />
//           )
//         } />
//         <Route path="/forgot-password" element={<ForgotPassword />} />

//         {/* Protected Admin Routes */}
//         <Route path="/dashboard/*" element={
//           userType === 'admin' ? <Dashboard /> : <Navigate to="/login" replace />
//         } />

//         {/* Protected Client Routes */}
//         <Route path="/client-portal/*" element={
//           userType === 'client' ? <ClientPortal /> : <Navigate to="/client-login" replace />
//         } />

//         {/* Root Route */}
//         <Route path="/" element={
//           userType === 'admin' ? <Navigate to="/dashboard" replace /> :
//           userType === 'client' ? <Navigate to="/client-portal" replace /> :
//           <Navigate to="/login" replace />
//         } />
//       </Routes>
//     </AuthContext.Provider>
//     <Toaster/>
//     </>
//   );
// }



// ***************NEW CODE**********



// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import ClientLogin from './pages/ClientLogin';
// import { Toaster } from 'react-hot-toast';
// import ClientPortal from './pages/client-portal/ClientPortal';
// import ProtectedRoute from './components/protectedRoutes/ProtectedRoute';
// import Dashboard from './pages/Dashboard';
// import DashboardHome from './pages/dashboard/DashboardHome';
// import ClientsPage from './pages/clients';
// import VisaApplicantsPage from './pages/applications';
// import JapanVisitPage from './pages/japan-visit';
// import TranslationsPage from './pages/translations';
// import EpassportPage from './pages/epassport';
// import GraphicDesignPage from './pages/graphic-design';
// import AppointmentPage from './pages/appointment';
// import ReportsPage from './pages/reports';
// import SettingsPage from './pages/settings';
// import OtherServicesPage from './pages/other-services';
// import AccountsPage from './pages/accounts';
// import AdminRoute from './components/admin/AdminProtectedRoute';

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route path='/client-login' element={<ClientLogin />} /> 
//         <Route path="/" element={<Navigate to="/client-login" />} /> 

//         {/* Protected Routes */}
//         <Route element={<ProtectedRoute />}> 
//           <Route path='/client-portal' element={<ClientPortal />} />
//         </Route>

//         {/* Admin Protected Routes */}
//         <Route path='/dashboard' element={<AdminRoute />}> 
//           <Route path='/dashboard/*' element={<Dashboard />}> 
//             <Route index element={<DashboardHome />} /> 
//             <Route path="clients/*" element={<ClientsPage />} /> 
//             <Route path="applications/*" element={<VisaApplicantsPage />} /> 
//             <Route path="japan-visit/*" element={<JapanVisitPage />} /> 
//             <Route path="translations/*" element={<TranslationsPage />} /> 
//             <Route path="epassport/*" element={<EpassportPage />} /> 
//             <Route path="graphic-design/*" element={<GraphicDesignPage />} /> 
//             <Route path="appointment/*" element={<AppointmentPage />} /> 
//             <Route path="reports/*" element={<ReportsPage />} /> 
//             <Route path="settings/*" element={<SettingsPage />} /> 
//             <Route path="other-services/*" element={<OtherServicesPage />} /> 
//             <Route path="accounts/*" element={<AccountsPage />} /> 
//           </Route>
//         </Route>

//         {/* Catch-All Route */}
//         <Route path="*" element={<div>404 Not Found</div>} /> 

//       </Routes>
//       <Toaster />
//     </Router>
//   );
// };

// export default App;













// ***************NEW CODE**********
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Modal } from 'antd';

import { useAuthGlobally } from './context/AuthContext';

import ClientLogin from './pages/ClientLogin';
import ClientPortal from './pages/client-portal/ClientPortal';
import ProtectedRoute from './components/protectedRoutes/ProtectedRoute';
import AdminRoute from './components/admin/AdminProtectedRoute';

import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import ClientsPage from './pages/clients';
import VisaApplicantsPage from './pages/applications';
import JapanVisitPage from './pages/japan-visit';
import TranslationsPage from './pages/translations';
import EpassportPage from './pages/epassport';
import GraphicDesignPage from './pages/graphic-design';
import AppointmentPage from './pages/appointment';
import ReportsPage from './pages/reports';
import SettingsPage from './pages/settings';
import OtherServicesPage from './pages/other-services';
import AccountsPage from './pages/accounts';
import useOnlineOfflineStatus from './components/onlineOfflineStatus/useOnlineOfflineStatus';

const App = () => {
    const [auth] = useAuthGlobally();
    const isOnline = useOnlineOfflineStatus();

    console.log(auth); // Debugging to ensure role is correct

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path='/client-login' element={<ClientLogin />} />
                <Route path="/" element={<Navigate to="/client-login" />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path='/client-portal' element={<ClientPortal />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route path="/dashboard" element={<AdminRoute />}>
                    <Route path="/dashboard/*" element={<Dashboard />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="clients/*" element={<ClientsPage />} />
                        <Route path="applications/*" element={<VisaApplicantsPage />} />
                        <Route path="japan-visit/*" element={<JapanVisitPage />} />
                        <Route path="translations/*" element={<TranslationsPage />} />
                        <Route path="epassport/*" element={<EpassportPage />} />
                        <Route path="graphic-design/*" element={<GraphicDesignPage />} />
                        <Route path="settings/*" element={<SettingsPage />} />
                        <Route path="other-services/*" element={<OtherServicesPage />} />
                        <Route path="accounts/*" element={<AccountsPage />} />

                        <Route path="reports/*" element={<ReportsPage />} />
                        <Route path="appointment/*" element={<AppointmentPage />} />

                    </Route>
                </Route>

                {/* Catch-All Route */}
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
            <Toaster />

            {/* Show Offline Modal */}
            {!isOnline && (
                <Modal
                    title="Offline 🔴"
                    open={!isOnline}
                    onCancel={() => {}} // Prevent modal close
                    footer={null}
                >
                    <h5>You are currently offline. Please check your internet connection.</h5>
                    <p>This page will refresh when you're back online.</p>
                </Modal>
            )}
        </Router>
    );
};

export default App;
