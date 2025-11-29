import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import AdminLayout from "../components/layout/AdminLayout";
import OverviewPage from "../pages/dashboard/OverviewPage";
import TransactionsPage from "../pages/dashboard/TransactionsPage";
import BudgetsPage from "../pages/dashboard/BudgetsPage";
import InsightsPage from "../pages/dashboard/InsightsPage";
import ChatbotPage from "../pages/dashboard/ChatbotPage";
import ProfilePage from "../pages/dashboard/ProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import { isAuthenticated } from "../utils/auth";
import LandingPage from "../pages/marketing/LandingPage";

const AppRouter = () => {
  const authed = isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing */}
        <Route path="/home" element={<LandingPage />} />
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User dashboard */}
        <Route
          path="/"
          element={authed ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<OverviewPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}> 
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
