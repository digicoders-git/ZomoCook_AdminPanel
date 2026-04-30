import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import AddCustomer from './pages/AddCustomer';
import JobList from './pages/JobList';
import AddJob from './pages/AddJob';
import CandidateList from './pages/CandidateList';
import AddCandidate from './pages/AddCandidate';
import AddNotification from './pages/AddNotification';
import NotificationList from './pages/NotificationList';
import QueryHistory from './pages/QueryHistory';
import AddRole from './pages/AddRole';
import RoleList from './pages/RoleList';
import AddUser from './pages/AddUser';
import UserList from './pages/UserList';
import MasterPage from './pages/MasterPage';
import WebSettings from './pages/WebSettings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AppliedCandidatesList from './pages/AppliedCandidatesList';
import ApplicationsList from './pages/ApplicationsList';
import ShortlistedCandidatesList from './pages/ShortlistedCandidatesList';
import DemoScheduledCandidatesList from './pages/DemoScheduledCandidatesList';
import RescheduleRequestsList from './pages/RescheduleRequestsList';
import RejectedCandidatesList from './pages/RejectedCandidatesList';
import OnHoldCandidatesList from './pages/OnHoldCandidatesList';
import NotInterestedCandidatesList from './pages/NotInterestedCandidatesList';
import HiredCandidatesList from './pages/HiredCandidatesList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        
        {/* Customer Routes */}
        <Route path="/customers/list" element={<Layout><CustomerList /></Layout>} />
        <Route path="/customers/add" element={<Layout><AddCustomer /></Layout>} />
        
        {/* Job Routes */}
        <Route path="/jobs/list" element={<Layout><JobList /></Layout>} />
        <Route path="/jobs/add" element={<Layout><AddJob /></Layout>} />
        
        {/* Candidate Routes */}
        <Route path="/candidates/list" element={<Layout><CandidateList /></Layout>} />
        <Route path="/candidates/add" element={<Layout><AddCandidate /></Layout>} />
        <Route path="/candidates/applied" element={<Layout><AppliedCandidatesList /></Layout>} />
        <Route path="/candidates/shortlisted" element={<Layout><ShortlistedCandidatesList /></Layout>} />
        <Route path="/candidates/demo-scheduled" element={<Layout><DemoScheduledCandidatesList /></Layout>} />
        <Route path="/candidates/reschedule-requests" element={<Layout><RescheduleRequestsList /></Layout>} />
        <Route path="/candidates/rejected" element={<Layout><RejectedCandidatesList /></Layout>} />
        <Route path="/candidates/on-hold" element={<Layout><OnHoldCandidatesList /></Layout>} />
        <Route path="/candidates/not-interested" element={<Layout><NotInterestedCandidatesList /></Layout>} />
        <Route path="/candidates/hired" element={<Layout><HiredCandidatesList /></Layout>} />
        
        {/* Notification Routes */}
        <Route path="/notifications/list" element={<Layout><NotificationList /></Layout>} />
        <Route path="/notifications/add" element={<Layout><AddNotification /></Layout>} />
        
        {/* Other Routes */}
        <Route path="/queries" element={<Layout><QueryHistory /></Layout>} />
        <Route path="/applications/all" element={<Layout><ApplicationsList /></Layout>} />
        {/* Roles & Permissions Routes */}
        <Route path="/roles/add" element={<Layout><AddRole /></Layout>} />
        <Route path="/roles/list" element={<Layout><RoleList /></Layout>} />
        
        {/* System User Routes */}
        <Route path="/users/add" element={<Layout><AddUser /></Layout>} />
        <Route path="/users/list" element={<Layout><UserList /></Layout>} />
        <Route path="/roles/users" element={<Navigate to="/users/list" replace />} />
        
        {/* Masters Routes (Dynamic) */}
        <Route path="/masters/:category/:action" element={<Layout><MasterPage /></Layout>} />
        
        <Route path="/settings" element={<Layout><WebSettings /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
