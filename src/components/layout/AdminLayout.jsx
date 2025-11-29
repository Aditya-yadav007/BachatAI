import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { isAdmin, isAuthenticated } from "../../utils/auth";

const AdminLayout = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin()) {
    // You can redirect to user dashboard or show "not authorised" page
    return <Navigate to="/" />;
  }

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col text-slate-800 dark:text-slate-200">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
