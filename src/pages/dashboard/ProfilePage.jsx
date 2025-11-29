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
    nickName: "",
    gender: "",
    photoUrl: "",
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

  // Sync local toggle state with global theme (Topbar uses localStorage 'theme')
  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "dark" || theme === "light") {
        setPreferences((prev) => ({ ...prev, darkMode: theme === "dark" }));
      }
    } catch {}
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (name) => {
    setPreferences((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const [imagePreview, setImagePreview] = useState("");
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setProfile((p) => ({ ...p, photoUrl: url }));
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
    // Update global theme source so Topbar and the app stay in sync
    try {
      const root = document.documentElement;
      if (preferences.darkMode) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch {}
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
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account details, preferences and security for{" "}
          {appConfig.appName}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info */}
        <Card className="lg:col-span-2">
          <div className="rounded-lg overflow-hidden mb-4">
            <div className="h-16 w-full bg-gradient-to-r from-blue-200 via-indigo-200 to-amber-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  { (imagePreview || profile.photoUrl) ? (
                    <img src={imagePreview || profile.photoUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">IMG</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{profile.name || "Your Name"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.email || "you@example.com"}</p>
                </div>
              </div>
              <button type="button" className="px-3 py-1.5 text-xs font-medium rounded-md bg-brand-500 text-white hover:bg-brand-600">Edit</button>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nick Name</label>
                <input
                  type="text"
                  name="nickName"
                  value={profile.nickName}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed dark:text-slate-400"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Country</label>
                <select
                  name="country"
                  value={profile.country}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Profile Image</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    { (imagePreview || profile.photoUrl) ? (
                      <img src={imagePreview || profile.photoUrl} alt="preview" className="h-full w-full object-cover" />
                    ) : null }
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Preferred Currency</label>
                <select
                  name="currency"
                  value={profile.currency}
                  onChange={handleProfileChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
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

        {/* Security */}
        <div className="space-y-4">
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
