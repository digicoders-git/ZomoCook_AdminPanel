import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import AddCustomer from './pages/AddCustomer';
import EditCustomer from './pages/EditCustomer';
import JobList from './pages/JobList';
import AddJob from './pages/AddJob';
import EditJob from './pages/EditJob';
import ViewJob from './pages/ViewJob';
import CandidateList from './pages/CandidateList';
import AddCandidate from './pages/AddCandidate';
import EditCandidate from './pages/EditCandidate';
import ViewCandidate from './pages/ViewCandidate';
import AddNotification from './pages/AddNotification';
import NotificationList from './pages/NotificationList';
import QueryHistory from './pages/QueryHistory';
import AddRole from './pages/AddRole';
import RoleList from './pages/RoleList';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import UserList from './pages/UserList';
import AssignPermissions from './pages/AssignPermissions';
import MasterPage from './pages/MasterPage';
import WebSettings from './pages/WebSettings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AppliedCandidatesList from './pages/AppliedCandidatesList';
import ApplicationsList from './pages/ApplicationsList';
import ShortlistedCandidatesList from './pages/ShortlistedCandidatesList';
import DemoScheduledCandidatesList from './pages/DemoScheduledCandidatesList';
import RescheduleRequestsList from './pages/RescheduleRequestsList';
import RejectedCandidatesList from './pages/RejectedCandidatesList';
import OnHoldCandidatesList from './pages/OnHoldCandidatesList';
import NotInterestedCandidatesList from './pages/NotInterestedCandidatesList';
import HiredCandidatesList from './pages/HiredCandidatesList';

// ─── Helper: Get current logged-in user's data ──────────────────────────────
const getAdminData = () => {
  try {
    return JSON.parse(localStorage.getItem('adminData') || '{}');
  } catch {
    return {};
  }
};

// ─── PermissionRoute ─────────────────────────────────────────────────────────
// permission = string (e.g. 'Dashboard') or null (open to all logged-in users)
// Super Admin (type === 'admin') → access to everything
// Regular User → must have the permission in their role.permissions array
const PermissionRoute = ({ children, permission = null }) => {
  const token = localStorage.getItem('adminToken');

  // 1. Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const adminData = getAdminData();

  // 2. Super Admin → full access
  const isSuperAdmin = adminData.type === 'admin';
  if (isSuperAdmin) return children;

  // 3. No specific permission required (e.g. /profile) → any logged-in user can access
  if (!permission) return children;

  // 4. Check role permissions
  const userPermissions = adminData?.role?.permissions || [];
  if (userPermissions.includes(permission)) return children;

  // 5. Permission denied → show 403
  return <Navigate to="/unauthorized" replace />;
};

// ─── PublicRoute: redirect logged-in user away from login ────────────────────
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (token) return <Navigate to="/" replace />;
  return children;
};

// ─── Axios Interceptor: auto-logout on 401 ───────────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ── Dashboard ──────────────────────────────────────────────── */}
        <Route path="/" element={
          <PermissionRoute permission="Dashboard">
            <Layout><Dashboard /></Layout>
          </PermissionRoute>
        } />

        {/* ── Customer Routes ────────────────────────────────────────── */}
        <Route path="/customers/list" element={
          <PermissionRoute permission="Customer/Client List">
            <Layout><CustomerList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/customers/add" element={
          <PermissionRoute permission="Add Customer/Client">
            <Layout><AddCustomer /></Layout>
          </PermissionRoute>
        } />
        <Route path="/customers/edit/:id" element={
          <PermissionRoute permission="Add Customer/Client">
            <Layout><EditCustomer /></Layout>
          </PermissionRoute>
        } />

        {/* ── Job Routes ─────────────────────────────────────────────── */}
        <Route path="/jobs/list" element={
          <PermissionRoute permission="Job List">
            <Layout><JobList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/jobs/add" element={
          <PermissionRoute permission="Add Job">
            <Layout><AddJob /></Layout>
          </PermissionRoute>
        } />
        <Route path="/jobs/edit/:id" element={
          <PermissionRoute permission="Add Job">
            <Layout><EditJob /></Layout>
          </PermissionRoute>
        } />
        <Route path="/jobs/view/:id" element={
          <PermissionRoute permission="Job List">
            <Layout><ViewJob /></Layout>
          </PermissionRoute>
        } />

        {/* ── Candidate Routes ───────────────────────────────────────── */}
        <Route path="/candidates/list" element={
          <PermissionRoute permission="Candidate List">
            <Layout><CandidateList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/add" element={
          <PermissionRoute permission="Add Candidate">
            <Layout><AddCandidate /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/edit/:id" element={
          <PermissionRoute permission="Add Candidate">
            <Layout><EditCandidate /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/view/:id" element={
          <PermissionRoute permission="Candidate List">
            <Layout><ViewCandidate /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/applied" element={
          <PermissionRoute permission="Applied Candidates List">
            <Layout><AppliedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/shortlisted" element={
          <PermissionRoute permission="Shortlisted Candidate List">
            <Layout><ShortlistedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/demo-scheduled" element={
          <PermissionRoute permission="Candidates">
            <Layout><DemoScheduledCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/reschedule-requests" element={
          <PermissionRoute permission="Candidates">
            <Layout><RescheduleRequestsList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/rejected" element={
          <PermissionRoute permission="Candidates">
            <Layout><RejectedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/on-hold" element={
          <PermissionRoute permission="Candidates">
            <Layout><OnHoldCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/not-interested" element={
          <PermissionRoute permission="Candidates">
            <Layout><NotInterestedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/hired" element={
          <PermissionRoute permission="Candidates">
            <Layout><HiredCandidatesList /></Layout>
          </PermissionRoute>
        } />

        {/* ── Notification Routes ────────────────────────────────────── */}
        <Route path="/notifications/list" element={
          <PermissionRoute permission="Notification List">
            <Layout><NotificationList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/notifications/add" element={
          <PermissionRoute permission="Add Notification">
            <Layout><AddNotification /></Layout>
          </PermissionRoute>
        } />

        {/* ── Other Routes ───────────────────────────────────────────── */}
        <Route path="/queries" element={
          <PermissionRoute permission="Query History">
            <Layout><QueryHistory /></Layout>
          </PermissionRoute>
        } />
        <Route path="/applications/all" element={
          <PermissionRoute permission="Candidates">
            <Layout><ApplicationsList /></Layout>
          </PermissionRoute>
        } />

        {/* ── Roles & Permissions Routes ─────────────────────────────── */}
        <Route path="/roles/add" element={
          <PermissionRoute permission="Add Role">
            <Layout><AddRole /></Layout>
          </PermissionRoute>
        } />
        <Route path="/roles/list" element={
          <PermissionRoute permission="Role List">
            <Layout><RoleList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/users/add" element={
          <PermissionRoute permission="Add User">
            <Layout><AddUser /></Layout>
          </PermissionRoute>
        } />
        <Route path="/users/edit/:id" element={
          <PermissionRoute permission="Add User">
            <Layout><EditUser /></Layout>
          </PermissionRoute>
        } />
        <Route path="/users/list" element={
          <PermissionRoute permission="User List">
            <Layout><UserList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/roles/permissions" element={
          <PermissionRoute permission="Add Role">
            <Layout><AssignPermissions /></Layout>
          </PermissionRoute>
        } />
        <Route path="/roles/users" element={<Navigate to="/users/list" replace />} />

        {/* ── Masters Routes ─────────────────────────────────────────── */}
        <Route path="/masters/:category/:action?" element={
          <PermissionRoute permission="Masters">
            <Layout><MasterPage /></Layout>
          </PermissionRoute>
        } />

        {/* ── Settings & Profile (all logged-in users) ───────────────── */}
        <Route path="/settings" element={
          <PermissionRoute permission="Web Settings">
            <Layout><WebSettings /></Layout>
          </PermissionRoute>
        } />
        <Route path="/profile" element={
          <PermissionRoute permission={null}>
            <Layout><Profile /></Layout>
          </PermissionRoute>
        } />

        {/* ── 404 fallback ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
