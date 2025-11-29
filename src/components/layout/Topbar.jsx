import appConfig from "../../config/appConfig";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../utils/auth";
import { rtdb } from "../../firebase/firebase";
import { ref, get, child } from "firebase/database";

const Topbar = () => {
  const [userName, setUserName] = useState("");

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

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          {appConfig.appName}
        </h1>
        <p className="text-xs text-slate-500">
          Smart insights for your money
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">Hi, {userName || "User"}</span>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
