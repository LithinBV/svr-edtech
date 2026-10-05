import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ============================================================
// USER ACTIVITY TRACKER
// ============================================================

import useUserActivity from "./hooks/useUserActivity";

// ============================================================
// HOME
// ============================================================

import Home from "./pages/Home.jsx";
import RequestDemo from "./pages/RequestDemo.jsx";

// ============================================================
// AUTH
// ============================================================

import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";

import CreateInstitution from "./pages/CreateInstitution.jsx";
import Institutions from "./pages/Institutions.jsx";

import AddUser from "./pages/AddUser.jsx";
import ViewUsers from "./pages/ViewUsers.jsx";
import EditUser from "./pages/EditUser.jsx";

// ============================================================
// PROFILE
// ============================================================

import Profile from "./pages/Profile.jsx";

// ============================================================
// EXECUTIVE PAGES
// ============================================================

import ExecutiveDashboard from "./pages/ExecutiveDashboard.jsx";
import ExecutiveLeads from "./pages/executive/ExecutiveLeads.jsx";
import ExecutiveFinishedLeads from "./pages/executive/ExecutiveFinishedLeads.jsx";
import ExecutiveFollowUps from "./pages/executive/ExecutiveFollowUps.jsx";

// ============================================================
// ADD LEAD
// ============================================================

import AddLead from "./pages/AddLead.jsx";

// ============================================================
// LEADS
// ============================================================

import AllLeads from "./pages/leads/AllLeads.jsx";
import NewLeads from "./pages/leads/NewLeads.jsx";
import HotLeads from "./pages/leads/HotLeads.jsx";
import WarmLeads from "./pages/leads/WarmLeads.jsx";
import ColdLeads from "./pages/leads/ColdLeads.jsx";
import MissedLeads from "./pages/leads/MissedLeads.jsx";

// ============================================================
// FINISHED LEADS
// ============================================================

import FinishedLeads from "./pages/leads/FinishedLeads.jsx";
import LeadDetails from "./pages/leads/LeadDetails.jsx";
import BulkUpdateLeads from "./pages/leads/BulkUpdateLeads.jsx";
import BulkUpload from "./pages/leads/BulkUpload.jsx";

// ============================================================
// ADMIN FOLLOW UPS
// ============================================================

import FollowUpsPage from "./pages/followups/FollowUpsPage.jsx";

// ============================================================
// OTHER PAGES
// ============================================================

import Teams from "./pages/Teams.jsx";

// ============================================================
// ADMIN COMPONENTS
// ============================================================

import Performance from "./components/Admin/Performance.jsx";

// ============================================================
// MANAGER REPORTS
// ============================================================

import ManagerReports from "./pages/manager/ManagerReports";

// ============================================================
// COMMON COMPONENTS
// ============================================================

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// ============================================================
// ADMIN LAYOUT
// ============================================================

import AdminLayout from "./layouts/AdminLayout.jsx";

// ============================================================
// MANAGER LAYOUT
// ============================================================

import ManagerLayout from "./components/manager/ManagerLayout";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerTeam from "./pages/manager/ManagerTeam";
import ManagerLeads from "./pages/manager/ManagerLeads";
import ManagerFinishedLeads from "./pages/manager/ManagerFinishedLeads";
import ManagerAssignLeads from "./pages/manager/ManagerAssignLeads";
import ManagerFollowUps from "./pages/manager/ManagerFollowUps";
import ManagerAddLead from "./pages/manager/ManagerAddLead";
import ManagerBulkUpload from "./pages/manager/ManagerBulkUpload";

// ============================================================
// EXECUTIVE LAYOUT
// ============================================================

import ExecutiveLayout from "./components/Executive/ExecutiveLayout.jsx";

// ============================================================
// COMMUNICATION
// ============================================================

import WhatsAppPage from "./pages/communications/WhatsAppPage.jsx";
import EmailPage from "./pages/communications/EmailPage.jsx";

// ============================================================
// TEMPORARY INSTITUTION ADMIN DASHBOARD
// ============================================================

function InstitutionAdminDashboard() {
  return (
    <div
      className="
        min-h-screen
        bg-gray-100
        flex
        items-center
        justify-center
        p-6
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-lg
          p-10
          text-center
          max-w-lg
          w-full
        "
      >
        <div className="text-5xl mb-5">
          🏫
        </div>

        <h1
          className="
            text-3xl
            font-bold
            text-gray-800
          "
        >
          Institution Admin Dashboard
        </h1>

        <p
          className="
            mt-3
            text-gray-600
          "
        >
          Welcome to the Institution Admin Dashboard.
        </p>

        <p
          className="
            mt-5
            text-sm
            text-gray-400
          "
        >
          You have successfully logged in.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MANAGER PLACEHOLDER
// ============================================================

function ManagerPlaceholder({ title }) {
  return (
    <div
      className="
        min-h-[calc(100vh-140px)]
        flex
        items-center
        justify-center
      "
    >
      <div className="text-center">
        <h1
          className="
            text-2xl
            font-semibold
            text-[#102236]
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-gray-500
          "
        >
          This page will be designed next.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// USER ACTIVITY TRACKER WRAPPER
// ============================================================

function UserActivityTracker({ children }) {
  useUserActivity();

  return <>{children}</>;
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            HOME PAGE
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ==================================================
            REQUEST DEMO
        ================================================== */}

        <Route
          path="/request-demo"
          element={<RequestDemo />}
        />

        {/* ==================================================
            LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==================================================
            FORGOT PASSWORD
        ================================================== */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ==================================================
            SUPER ADMIN LAYOUT
        ================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN",
              ]}
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          {/* =================================================
              ADMIN DASHBOARD
          ================================================= */}

          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin"
            element={
              <Navigate
                to="/admin-dashboard"
                replace
              />
            }
          />

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <Route
            path="/analytics"
            element={
              <AdminAnalytics
                view="overview"
              />
            }
          />

          <Route
            path="/analytics/date-wise"
            element={
              <AdminAnalytics
                view="date-wise"
              />
            }
          />

          <Route
            path="/analytics/source-wise"
            element={
              <AdminAnalytics
                view="source-wise"
              />
            }
          />

          <Route
            path="/analytics/program-wise"
            element={
              <AdminAnalytics
                view="program-wise"
              />
            }
          />

          <Route
            path="/analytics/user-wise"
            element={
              <AdminAnalytics
                view="user-wise"
              />
            }
          />

          {/* =================================================
              PROFILE
          ================================================= */}

          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* =================================================
              INSTITUTIONS
          ================================================= */}

          <Route
            path="/create-institution"
            element={<CreateInstitution />}
          />

          <Route
            path="/institutions"
            element={<Institutions />}
          />

          {/* =================================================
              USERS
          ================================================= */}

          <Route
            path="/add-user"
            element={<AddUser />}
          />

          <Route
            path="/view-users"
            element={<ViewUsers />}
          />

          <Route
            path="/edit-user/:id"
            element={<EditUser />}
          />

          {/* =================================================
              LEADS
          ================================================= */}

          <Route
            path="/add-lead"
            element={<AddLead />}
          />

          <Route
            path="/all-leads"
            element={<AllLeads />}
          />

          {/* =================================================
              FINISHED LEADS
          ================================================= */}

          <Route
            path="/finished-leads"
            element={<FinishedLeads />}
          />

          <Route
            path="/bulk-update-leads"
            element={<BulkUpdateLeads />}
          />

          <Route
            path="/new-leads"
            element={<NewLeads />}
          />

          <Route
            path="/hot-leads"
            element={<HotLeads />}
          />

          <Route
            path="/warm-leads"
            element={<WarmLeads />}
          />

          <Route
            path="/cold-leads"
            element={<ColdLeads />}
          />

          <Route
            path="/missed-leads"
            element={<MissedLeads />}
          />

          <Route
            path="/bulk-upload-leads"
            element={<BulkUpload />}
          />

          {/* =================================================
              ADMIN FOLLOW UPS
          ================================================= */}

          <Route
            path="/follow-ups"
            element={
              <FollowUpsPage
                type="ALL"
                title="All Follow Ups"
                description="All scheduled follow-ups."
              />
            }
          />

          <Route
            path="/today-follow-ups"
            element={
              <FollowUpsPage
                type="TODAY"
                title="Today Follow Ups"
                description="Follow-ups scheduled for today."
              />
            }
          />

          <Route
            path="/upcoming-follow-ups"
            element={
              <FollowUpsPage
                type="UPCOMING"
                title="Upcoming Follow Ups"
                description="Follow-ups scheduled for future dates."
              />
            }
          />

          <Route
            path="/overdue-follow-ups"
            element={
              <FollowUpsPage
                type="OVERDUE"
                title="Overdue Follow Ups"
                description="Follow-ups whose scheduled time has passed."
              />
            }
          />

          <Route
            path="/completed-follow-ups"
            element={
              <FollowUpsPage
                type="COMPLETED"
                title="Completed Follow Ups"
                description="Follow-ups that have already been completed."
              />
            }
          />

          {/* =================================================
              TEAMS
          ================================================= */}

          <Route
            path="/teams"
            element={<Teams />}
          />

          {/* =================================================
              PERFORMANCE
          ================================================= */}

          <Route
            path="/performance"
            element={<Performance />}
          />

        </Route>

        {/* ==================================================
            INSTITUTION ADMIN
        ================================================== */}

        <Route
          path="/institution-admin-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INSTITUTION_ADMIN",
              ]}
            >
              <InstitutionAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            MANAGER PORTAL
        ================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "MANAGER",
                "USER_MANAGER",
              ]}
            >
              <UserActivityTracker>
                <ManagerLayout />
              </UserActivityTracker>
            </ProtectedRoute>
          }
        >

          {/* =================================================
              MANAGER DASHBOARD
          ================================================= */}

          <Route
            path="/manager-dashboard"
            element={<ManagerDashboard />}
          />

          {/* =================================================
              MY TEAM
          ================================================= */}

          <Route
            path="/manager-team"
            element={<ManagerTeam />}
          />

          {/* =================================================
              MANAGER LEADS
          ================================================= */}

          <Route
            path="/manager-leads"
            element={<ManagerLeads />}
          />

          {/* =================================================
              MANAGER FINISHED LEADS
          ================================================= */}

          <Route
            path="/manager-finished-leads"
            element={<ManagerFinishedLeads />}
          />

          {/* =================================================
              ASSIGN LEADS
          ================================================= */}

          <Route
            path="/manager-assign-leads"
            element={<ManagerAssignLeads />}
          />

          {/* =================================================
              ADD LEAD MANUALLY
          ================================================= */}

          <Route
            path="/manager-add-lead"
            element={<ManagerAddLead />}
          />

          {/* =================================================
              BULK UPLOAD
          ================================================= */}

          <Route
            path="/manager-bulk-upload"
            element={<ManagerBulkUpload />}
          />

          {/* =================================================
              FOLLOW UPS
          ================================================= */}

          <Route
            path="/manager-follow-ups"
            element={<ManagerFollowUps />}
          />

          {/* =================================================
              OLD ASSIGN LEADS ROUTE
          ================================================= */}

          <Route
            path="/manager-assign-leads-old"
            element={
              <ManagerPlaceholder
                title="Assign Leads"
              />
            }
          />

          {/* =================================================
              REPORTS
          ================================================= */}

          <Route
            path="/manager-reports"
            element={<ManagerReports />}
          />

          {/* =================================================
              MY PROFILE
          ================================================= */}

          <Route
            path="/manager-profile"
            element={<Profile />}
          />

        </Route>

        {/* ==================================================
            EXECUTIVE PORTAL
        ================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "EXECUTIVE",
                "USER_EXECUTIVE",
              ]}
            >
              <UserActivityTracker>
                <ExecutiveLayout />
              </UserActivityTracker>
            </ProtectedRoute>
          }
        >

          {/* =================================================
              EXECUTIVE DASHBOARD
          ================================================= */}

          <Route
            path="/executive-dashboard"
            element={<ExecutiveDashboard />}
          />

          {/* =================================================
              EXECUTIVE LEADS
          ================================================= */}

          <Route
            path="/executive-leads"
            element={<ExecutiveLeads />}
          />

          {/* =================================================
              EXECUTIVE FINISHED LEADS
          ================================================= */}

          <Route
            path="/executive-finished-leads"
            element={<ExecutiveFinishedLeads />}
          />

          {/* =================================================
              EXECUTIVE FOLLOW UPS
          ================================================= */}

          <Route
            path="/executive-follow-ups"
            element={<ExecutiveFollowUps />}
          />

          {/* =================================================
              EXECUTIVE PROFILE
          ================================================= */}

          <Route
            path="/executive-profile"
            element={<Profile />}
          />

        </Route>

        {/* ==================================================
            LEAD DETAILS
        ================================================== */}

        <Route
          path="/leads/:id"
          element={<LeadDetails />}
        />

        {/* ==================================================
            WHATSAPP COMMUNICATION
        ================================================== */}

        <Route
          path="/communications/whatsapp/:leadId"
          element={<WhatsAppPage />}
        />

        {/* ==================================================
            EMAIL COMMUNICATION
        ================================================== */}

        <Route
          path="/communications/email/:leadId"
          element={<EmailPage />}
        />

        {/* ==================================================
            UNKNOWN ROUTES
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;