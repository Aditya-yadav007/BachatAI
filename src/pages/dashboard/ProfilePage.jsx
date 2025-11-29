import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import appConfig from "../../config/appConfig";
import { getCurrentUser } from "../../utils/auth";
import { rtdb } from "../../firebase/firebase";
import { ref, get, child, set, update } from "firebase/database";

const ProfilePage = () => {
  // Dummy initial data – later replace with API data from /me
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "+91 98765 43210",
    currency: "INR",
    country: "India",
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    monthlyReportEmail: true,
    budgetAlerts: true,
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setProfile((p) => ({ ...p, name: u.name || p.name, email: u.email || p.email }));
      // Try hydrate from RTDB users/{uid} if present
      if (u.uid) {
        get(child(ref(rtdb), `users/${u.uid}`)).then((snap) => {
          if (snap.exists()) {
            const val = snap.val();
            setProfile((p) => ({
              ...p,
              name: val.name || p.name,
              email: val.email || p.email,
            }));
          }
        }).catch(() => {});
        // Load preferences from RTDB if present
        get(child(ref(rtdb), `users/${u.uid}/preferences`)).then((snap) => {
          if (snap.exists()) {
            const prefs = snap.val() || {};
            setPreferences((prev) => ({
              darkMode: !!prefs.darkMode,
              monthlyReportEmail: prefs.monthlyReportEmail ?? prev.monthlyReportEmail,
              budgetAlerts: prefs.budgetAlerts ?? prev.budgetAlerts,
            }));
          } else {
            // Fallback: localStorage
            try {
              const raw = localStorage.getItem("preferences");
              if (raw) {
                const p = JSON.parse(raw);
                setPreferences((prev) => ({
                  darkMode: !!p.darkMode,
                  monthlyReportEmail: p.monthlyReportEmail ?? prev.monthlyReportEmail,
                  budgetAlerts: p.budgetAlerts ?? prev.budgetAlerts,
                }));
              }
            } catch {}
          }
        }).catch(() => {});
      }
    }
  }, []);

  // Apply dark mode to document root whenever preference changes
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [preferences.darkMode]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (name) => {
    setPreferences((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    // TODO: call backend API: PUT /me
    setTimeout(() => {
      setIsSavingProfile(false);
      alert("Profile details saved (dummy). Later connect to backend API.");
    }, 600);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setIsSavingPrefs(true);

    // TODO: call backend API: PUT /me/preferences
    const u = getCurrentUser();
    if (u?.uid) {
      update(ref(rtdb, `users/${u.uid}/preferences`), {
        darkMode: preferences.darkMode,
        monthlyReportEmail: preferences.monthlyReportEmail,
        budgetAlerts: preferences.budgetAlerts,
      }).catch(() => {});
    }
    try {
      localStorage.setItem("preferences", JSON.stringify(preferences));
    } catch {}
    setTimeout(() => {
      setIsSavingPrefs(false);
      alert("Preferences saved (dummy). Later connect to backend API.");
    }, 600);
  };

  const handleLogoutAll = () => {
    // TODO: optional API call to invalidate tokens
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Profile</h2>
        <p className="text-sm text-slate-500">
          Manage your account details, preferences and security for{" "}
          {appConfig.appName}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Account Details
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email (login)
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 cursor-not-allowed"
                  disabled
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Email is used as your login ID. To change it, contact support
                  (for project, just mention this in documentation).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Preferred Currency
                </label>
                <select
                  name="currency"
                  value={profile.currency}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  In future, this can control how amounts are displayed across
                  the app.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </Card>

        {/* Preferences / security */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Preferences
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-3">
              <ToggleRow
                label="Enable dark mode (UI preference)"
                description="For now this is only stored locally. In a full version, this would sync with your account."
                checked={preferences.darkMode}
                onChange={() => handlePreferenceToggle("darkMode")}
              />

              <ToggleRow
                label="Email monthly reports"
                description="Receive a summary of your income, expenses and savings every month."
                checked={preferences.monthlyReportEmail}
                onChange={() => handlePreferenceToggle("monthlyReportEmail")}
              />

              <ToggleRow
                label="Budget alerts"
                description="Get notifications when your spending crosses a defined budget limit."
                checked={preferences.budgetAlerts}
                onChange={() => handlePreferenceToggle("budgetAlerts")}
              />

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPrefs}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {isSavingPrefs ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              Security
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Manage your session and account security.
            </p>

            <div className="space-y-2 text-sm">
              <button
                type="button"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-left hover:bg-slate-50 text-slate-700 text-xs"
                onClick={() =>
                  alert(
                    "In the full system, this will open a Reset Password flow."
                  )
                }
              >
                Reset password
              </button>

              <button
                type="button"
                className="w-full border border-red-200 text-red-600 rounded-lg px-3 py-2 text-left hover:bg-red-50 text-xs"
                onClick={handleLogoutAll}
              >
                Logout from this device
              </button>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              For the project demo, you can explain that advanced security
              features like 2FA, device management etc. are part of future
              scope.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// Small reusable toggle row component
const ToggleRow = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between gap-3 border border-slate-100 rounded-lg px-3 py-2 bg-slate-50">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
          checked ? "bg-brand-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};
