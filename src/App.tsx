

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

    // console.log(auth); // Debugging to ensure role is correct
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











// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { Modal } from 'antd';

// import { useAuthGlobally } from './context/AuthContext';

// import ClientLogin from './pages/ClientLogin';
// import ClientPortal from './pages/client-portal/ClientPortal';
// import ProtectedRoute from './components/protectedRoutes/ProtectedRoute';
// import AdminRoute from './components/admin/AdminProtectedRoute';

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
// import useOnlineOfflineStatus from './components/onlineOfflineStatus/useOnlineOfflineStatus';

// const App = () => {
//     const [auth] = useAuthGlobally();
//     const isOnline = useOnlineOfflineStatus();

//     console.log(auth); // Debugging to ensure role is correct

//     return (
//         <Router>
//             <Routes>
//                 {/* Public Routes */}
//                 <Route path='/client-login' element={<ClientLogin />} />
//                 <Route path="/" element={<Navigate to="/client-login" />} />

//                 {/* Protected Routes */}
//                 <Route element={<ProtectedRoute />}>
//                     <Route path='/client-portal' element={<ClientPortal />} />
//                 </Route>

//                 {/* Admin and SuperAdmin Routes */}
//                 {auth.user.role === 'superAdmin' ? (
//                    <>
//                     <Route path="reports/*" element={<ReportsPage />} />
//                     <Route path="appointment/*" element={<AppointmentPage />} />
//                    </>
//                 ) : (
//                     <Route path="/dashboard/*" element={<AdminRoute />}>
//                         <Route path="" element={<Dashboard />}>
//                             <Route index element={<DashboardHome />} />
//                             <Route path="clients/*" element={<ClientsPage />} />
//                             <Route path="applications/*" element={<VisaApplicantsPage />} />
//                             <Route path="japan-visit/*" element={<JapanVisitPage />} />
//                             <Route path="translations/*" element={<TranslationsPage />} />
//                             <Route path="epassport/*" element={<EpassportPage />} />
//                             <Route path="graphic-design/*" element={<GraphicDesignPage />} />
//                             <Route path="settings/*" element={<SettingsPage />} />
//                             <Route path="other-services/*" element={<OtherServicesPage />} />
//                             <Route path="accounts/*" element={<AccountsPage />} />
//                         </Route>
//                     </Route>
//                 )}

//                 {/* Catch-All Route */}
//                 <Route path="*" element={<div>404 Not Found</div>} />
//             </Routes>
//             <Toaster />

//             {/* Show Offline Modal */}
//             {!isOnline && (
//                 <Modal
//                     title="Offline 🔴"
//                     open={!isOnline}
//                     onCancel={() => {}} // Prevent modal close
//                     footer={null}
//                 >
//                     <h5>You are currently offline. Please check your internet connection.</h5>
//                     <p>This page will refresh when you're back online.</p>
//                 </Modal>
//             )}
//         </Router>
//     );
// };

// export default App;
