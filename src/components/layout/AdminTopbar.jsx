import { getCurrentUser } from "../../utils/auth";

const AdminTopbar = () => {
  const user = getCurrentUser();

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-semibold text-slate-800">
          Admin Panel
        </h1>
        <p className="text-xs text-slate-500">
          Manage users, settings and system-wide insights.
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span>{user?.name || "Admin"}</span>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
