import { NavLink } from "react-router-dom";
import appConfig from "../../config/appConfig";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/transactions", label: "Transactions" },
  { to: "/budgets", label: "Budgets" },
  { to: "/insights", label: "Insights" },
  { to: "/chatbot", label: "Chatbot" },
  { to: "/profile", label: "Profile" },
];

const Sidebar = () => {
  return (
    <aside className="h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
          {appConfig.appName}
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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

export default Sidebar;
