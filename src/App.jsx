import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { requestFCMToken, onForegroundMessage } from './firebase';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import AddCustomer from './pages/AddCustomer';
import EditCustomer from './pages/EditCustomer';
import CustomerDashboard from './pages/CustomerDashboard';
import JobList from './pages/JobList';
import PendingJobs from './pages/PendingJobs';
import AddJob from './pages/AddJob';
import EditJob from './pages/EditJob';
import ViewJob from './pages/ViewJob';
import ReplacementDashboard from './pages/ReplacementDashboard';
import CandidateList from './pages/CandidateList';
import AddCandidate from './pages/AddCandidate';
import EditCandidate from './pages/EditCandidate';
import ViewCandidate from './pages/ViewCandidate';
import AddNotification from './pages/AddNotification';
import NotificationList from './pages/NotificationList';
import QueryHistory from './pages/QueryHistory';
import AddRole from './pages/AddRole';
import RolePermissionManagement from './pages/RolePermissionManagement';
import RoleList from './pages/RoleList';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import UserList from './pages/UserList';
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
import PlanList from './pages/PlanList';
import AddPlan from './pages/AddPlan';
import EditPlan from './pages/EditPlan';
import SubscriptionList from './pages/SubscriptionList';
import OfferList from './pages/OfferList';
import BannerList from './pages/BannerList';
import PendingCookApprovals from './pages/PendingCookApprovals';
import FinanceRevenue from './pages/FinanceRevenue';

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
  if (userPermissions.includes('global:full_access')) return children;

  const checkPermission = (permToCheck) => {
    if (!permToCheck) return true;
    if (userPermissions.includes(permToCheck)) return true;

    // Legacy normalization mapping
    const mapping = {
      'dashboard:view': ['Dashboard', 'dashboard'],
      'customer_client:view': ['Customer/Client', 'Customer/Client List', 'Customer List', 'customer_client'],
      'customer_client:add': ['Add Customer/Client', 'Add Customer', 'customer_client'],
      'customer_client:edit': ['Edit Customer', 'customer_client'],
      'job_management:view': ['Jobs', 'Job List', 'Pending Jobs', 'job_management'],
      'job_management:add': ['Add Job', 'job_management'],
      'candidates:view': ['Candidates', 'Candidate List', 'All Applications', 'Applied Candidates List', 'Shortlisted Candidate List', 'candidates'],
      'candidates:add': ['Add Candidate', 'candidates'],
      'service_packages:view': ['Subscription Plans', 'Plan List', 'Subscription History', 'service_packages'],
      'service_packages:add': ['Add Plan', 'service_packages'],
      'offer_management:view': ['Offers', 'offer_management'],
      'banner_management:view': ['Banners', 'banner_management'],
      'cook_approvals:view': ['Cook Approvals', 'cook_approvals'],
      'notifications:view': ['Notifications', 'Notification List', 'notifications'],
      'notifications:add': ['Add Notification', 'notifications'],
      'query_management:view': ['Query History', 'query_management'],
      'finance_revenue:view': ['Finance / Revenue', 'finance_revenue'],
      'role_permission:view': ['Roles & Permissions', 'User List', 'role_permission'],
      'role_permission:add': ['Add Role', 'Add User', 'role_permission'],
      'role_permission:manage': ['Manage Roles', 'role_permission'],
      'masters:view': ['Masters', 'masters'],
      'settings:view': ['Web Settings', 'settings']
    };

    const legacyNames = mapping[permToCheck];
    if (legacyNames) {
      return legacyNames.some(name => 
        userPermissions.includes(name) || 
        userPermissions.some(up => String(up).toLowerCase() === name.toLowerCase())
      );
    }
    return false;
  };

  if (checkPermission(permission)) return children;

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
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            localStorage.setItem('adminData', JSON.stringify(response.data));
          }
        } catch (error) {
          // If 401, the interceptor will handle logout
          console.error("Failed to fetch latest profile", error);
        }
      }
      setProfileLoaded(true);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const initFCM = async () => {
      const fcmToken = await requestFCMToken();
      if (!fcmToken) return;
      const token = localStorage.getItem('adminToken');
      axios.post(`${API_BASE_URL}/notifications/save-token`, { token: fcmToken }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    };

    initFCM();

    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification;
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, { 
          body, 
          icon: '/logo.png',
          data: payload.data
        });
      });
    });

    return () => unsubscribe();
  }, []);

  if (!profileLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ── Dashboard ──────────────────────────────────────────────── */}
        <Route path="/" element={
          <PermissionRoute permission={null}>
            <Layout><Dashboard /></Layout>
          </PermissionRoute>
        } />
        
        {/* ── Finance / Revenue ──────────────────────────────────────── */}
        <Route path="/finance" element={
          <PermissionRoute permission="finance_revenue:view">
            <Layout><FinanceRevenue /></Layout>
          </PermissionRoute>
        } />

        {/* ── Customer Routes ────────────────────────────────────────── */}
        <Route path="/customers/list" element={
          <PermissionRoute permission="customer_client:view">
            <Layout><CustomerList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/customers/add" element={
          <PermissionRoute permission="customer_client:add">
            <Layout><AddCustomer /></Layout>
          </PermissionRoute>
        } />
        <Route path="/customers/edit/:id" element={
          <PermissionRoute permission="customer_client:edit">
            <Layout><EditCustomer /></Layout>
          </PermissionRoute>
        } />
        <Route path="/customers/dashboard/:id" element={
          <PermissionRoute permission="customer_client:view">
            <Layout><CustomerDashboard /></Layout>
          </PermissionRoute>
        } />

        {/* ── Job Routes ─────────────────────────────────────────────── */}
        <Route path="/jobs/list" element={
          <PermissionRoute permission="job_management:view">
            <Layout><JobList /></Layout>
          </PermissionRoute>
        } />
        
        <Route path="/pending-jobs" element={
          <PermissionRoute permission="job_management:view">
            <Layout><PendingJobs /></Layout>
          </PermissionRoute>
        } />
        <Route path="/jobs/add" element={
          <PermissionRoute permission="job_management:add">
            <Layout><AddJob /></Layout>
          </PermissionRoute>
        } />
        <Route path="/jobs/edit/:id" element={
          <PermissionRoute permission="job_management:edit">
            <Layout><EditJob /></Layout>
          </PermissionRoute>
        } />
        <Route path="/jobs/view/:id" element={
          <PermissionRoute permission="job_management:view">
            <Layout><ViewJob /></Layout>
          </PermissionRoute>
        } />
        <Route path="/replacements" element={
          <PermissionRoute permission="job_management:view">
            <Layout><ReplacementDashboard /></Layout>
          </PermissionRoute>
        } />

        {/* ── Candidate Routes ───────────────────────────────────────── */}
        <Route path="/candidates/list" element={
          <PermissionRoute permission="candidates:view">
            <Layout><CandidateList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/add" element={
          <PermissionRoute permission="candidates:add">
            <Layout><AddCandidate /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/edit/:id" element={
          <PermissionRoute permission="candidates:edit">
            <Layout><EditCandidate /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/view/:id" element={
          <PermissionRoute permission="candidates:view">
            <Layout><ViewCandidate /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/applied" element={
          <PermissionRoute permission="candidates:view">
            <Layout><AppliedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/shortlisted" element={
          <PermissionRoute permission="candidates:view">
            <Layout><ShortlistedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/demo-scheduled" element={
          <PermissionRoute permission="candidates:view">
            <Layout><DemoScheduledCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/reschedule-requests" element={
          <PermissionRoute permission="candidates:view">
            <Layout><RescheduleRequestsList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/rejected" element={
          <PermissionRoute permission="candidates:view">
            <Layout><RejectedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/on-hold" element={
          <PermissionRoute permission="candidates:view">
            <Layout><OnHoldCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/not-interested" element={
          <PermissionRoute permission="candidates:view">
            <Layout><NotInterestedCandidatesList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/candidates/hired" element={
          <PermissionRoute permission="candidates:view">
            <Layout><HiredCandidatesList /></Layout>
          </PermissionRoute>
        } />

        {/* ── Notification Routes ────────────────────────────────────── */}
        <Route path="/notifications/list" element={
          <PermissionRoute permission="notifications:view">
            <Layout><NotificationList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/notifications/add" element={
          <PermissionRoute permission="notifications:add">
            <Layout><AddNotification /></Layout>
          </PermissionRoute>
        } />

        {/* ── Plans Routes ───────────────────────────────────────────── */}
        <Route path="/plans/list" element={
          <PermissionRoute permission="service_packages:view">
            <Layout><PlanList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/plans/add" element={
          <PermissionRoute permission="service_packages:add">
            <Layout><AddPlan /></Layout>
          </PermissionRoute>
        } />
        <Route path="/plans/edit/:id" element={
          <PermissionRoute permission="service_packages:edit">
            <Layout><EditPlan /></Layout>
          </PermissionRoute>
        } />
        <Route path="/plans/subscriptions" element={
          <PermissionRoute permission="service_packages:view">
            <Layout><SubscriptionList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/offers" element={
          <PermissionRoute permission="offer_management:view">
            <Layout><OfferList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/banners" element={
          <PermissionRoute permission="banner_management:view">
            <Layout><BannerList /></Layout>
          </PermissionRoute>
        } />

        {/* ── Other Routes ───────────────────────────────────────────── */}
        <Route path="/queries" element={
          <PermissionRoute permission="query_management:view">
            <Layout><QueryHistory /></Layout>
          </PermissionRoute>
        } />
        <Route path="/applications/all" element={
          <PermissionRoute permission="candidates:view">
            <Layout><ApplicationsList /></Layout>
          </PermissionRoute>
        } />

        {/* ── Roles & Permissions Routes ─────────────────────────────── */}
        <Route path="/roles/add" element={
          <PermissionRoute permission="role_permission:add">
            <Layout><AddRole /></Layout>
          </PermissionRoute>
        } />
        <Route path="/roles/list" element={<Navigate to="/roles/permissions" replace />} />
        <Route path="/users/add" element={
          <PermissionRoute permission="role_permission:add">
            <Layout><AddUser /></Layout>
          </PermissionRoute>
        } />
        <Route path="/users/edit/:id" element={
          <PermissionRoute permission="role_permission:edit">
            <Layout><EditUser /></Layout>
          </PermissionRoute>
        } />
        <Route path="/users/list" element={
          <PermissionRoute permission="role_permission:view">
            <Layout><UserList /></Layout>
          </PermissionRoute>
        } />
        <Route path="/roles/permissions" element={
          <PermissionRoute permission="role_permission:manage">
            <Layout><RolePermissionManagement /></Layout>
          </PermissionRoute>
        } />
        <Route path="/roles/users" element={<Navigate to="/users/list" replace />} />

        {/* ── Masters Routes ─────────────────────────────────────────── */}
        <Route path="/masters/:category/:action?" element={
          <PermissionRoute permission="masters:view">
            <Layout><MasterPage /></Layout>
          </PermissionRoute>
        } />

        {/* ── Cook Approvals Routes ─────────────────────────────────── */}
        <Route path="/cook-approvals" element={
          <PermissionRoute permission="cook_approvals:view">
            <Layout><PendingCookApprovals /></Layout>
          </PermissionRoute>
        } />

        {/* ── Settings & Profile (all logged-in users) ───────────────── */}
        <Route path="/settings" element={
          <PermissionRoute permission="settings:view">
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
