import { Routes, Route } from 'react-router-dom';
import DashboardHome from './dashboard/DashboardHome';
import ClientsPage from './clients';
import VisaApplicantsPage from './applications';
import JapanVisitPage from './japan-visit';
import TranslationsPage from './translations';
import EpassportPage from './epassport';
import GraphicDesignPage from './graphic-design';
import AppointmentPage from './appointment';
import ReportsPage from './reports';
import SettingsPage from './settings';
import OtherServicesPage from './other-services';
import AccountsPage from './accounts';
import Layout from '../components/Layout';
import CallLogs from './callLogs/CallLogs';
import Campaign from './campaign/Campaign';
import ChatWithUs from './chatwithus/ChatWithUs';
import ManageApp from '../components/appManagement/ManageApp';
import Chat from '../chat/Chat';

export default function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="clients/*" element={<ClientsPage />} />
        <Route path="applications/*" element={<VisaApplicantsPage />} />
        <Route path="japan-visit/*" element={<JapanVisitPage />} />
        <Route path="translations/*" element={<TranslationsPage />} />
        <Route path="epassport/*" element={<EpassportPage />} />
        <Route path="graphic-design/*" element={<GraphicDesignPage />} />
        <Route path="appointment/*" element={<AppointmentPage />} />
        <Route path="reports/*" element={<ReportsPage />} />
        <Route path="settings/*" element={<SettingsPage />} />
        <Route path="other-services/*" element={<OtherServicesPage />} />
        <Route path="accounts/*" element={<AccountsPage />} />
        <Route path="call-logs/*" element={<CallLogs />} />
        <Route path="campaign/*" element={<Campaign />} />
        <Route path="chat-with-us/*" element={<ChatWithUs />} />
        {/* <Route path="chat/*" element={<Chat />} /> */}
        <Route path="manage-app/*" element={<ManageApp />} />
      </Routes>
    </Layout>
  );
}
