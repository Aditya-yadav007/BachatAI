import appConfig from "../../config/appConfig";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../utils/auth";
import { rtdb } from "../../firebase/firebase";
import { ref, get, child } from "firebase/database";

const Topbar = () => {
  const [userName, setUserName] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u?.name) setUserName(u.name);
    if (u?.uid) {
      get(child(ref(rtdb), `users/${u.uid}`))
        .then((snap) => {
          if (snap.exists()) {
            const val = snap.val() || {};
            if (val.name) setUserName(val.name);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enableDark = saved ? saved === "dark" : prefersDark;
    setIsDark(enableDark);
    const root = document.documentElement;
    if (enableDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {appConfig.appName}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Smart insights for your money
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600 dark:text-slate-300">Hi, {userName || "User"}</span>
        <button
          onClick={toggleTheme}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          {isDark ? (
            <span aria-label="Switch to light mode" title="Light mode">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/>
                <path fillRule="evenodd" d="M12 1.25a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0V2A.75.75 0 0 1 12 1.25Zm0 18a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm10-8a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1 0-1.5h2a.75.75 0 0 1 .75.75ZM4.75 12a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1 0-1.5h2a.75.75 0 0 1 .75.75Zm13.45-6.45a.75.75 0 0 1 1.06 0l1.414 1.414a.75.75 0 0 1-1.06 1.06L18.2 6.61a.75.75 0 0 1 0-1.06Zm-13.3 13.3a.75.75 0 0 1 0 1.06L1.486 21.324a.75.75 0 0 1-1.06-1.06L2.88 16.79a.75.75 0 0 1 1.06 0Zm13.3 1.06a.75.75 0 0 1-1.06 0L16.726 18.2a.75.75 0 1 1 1.06-1.06l1.414 1.414a.75.75 0 0 1 0 1.06ZM2.88 7.21A.75.75 0 0 1 1.82 6.15L.404 4.736a.75.75 0 0 1 1.06-1.06L2.88 5.09a.75.75 0 0 1 0 1.06Z" clipRule="evenodd"/>
              </svg>
            </span>
          ) : (
            <span aria-label="Switch to dark mode" title="Dark mode">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M21.752 15.002A9 9 0 1 1 11.998 2.248a.75.75 0 0 1 .862.998A7.5 7.5 0 1 0 20.754 14.14a.75.75 0 0 1 .998.862Z"/>
              </svg>
            </span>
          )}
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="text-xs px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
