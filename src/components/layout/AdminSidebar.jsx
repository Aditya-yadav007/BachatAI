import { NavLink } from "react-router-dom";
import appConfig from "../../config/appConfig";

const adminNavItems = [
  { to: "/admin", label: "Admin Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/settings", label: "Settings" },
];

const AdminSidebar = () => {
  return (
    <aside className="h-full w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-800">
        <span className="text-xl font-semibold">
          {appConfig.appName} <span className="text-xs">Admin</span>
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-200 hover:bg-slate-800/70"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
