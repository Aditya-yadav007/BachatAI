import Card from "../../components/ui/Card";
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/firebase";
import { ref, get, child, push, remove, serverTimestamp, set } from "firebase/database";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await get(child(ref(rtdb), "users"));
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.val() || {};
          const list = Object.keys(data).map((uid) => {
            const u = data[uid] || {};
            let joined = "-";
            const ts = u.createdAt;
            // serverTimestamp becomes number when resolved; handle object fallback
            if (typeof ts === "number") {
              joined = new Date(ts).toISOString().slice(0, 10);
            }
            return {
              id: uid,
              name: u.name || "",
              email: u.email || "",
              role: u.role || "user",
              status: "Active",
              joined,
            };
          });
          setUsers(list);
        } else {
          setUsers([]);
        }
      } catch {
        setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await remove(ref(rtdb, `users/${id}`));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert("Failed to delete user.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!newUser.name || !newUser.email) {
      setError("Name and Email are required.");
      return;
    }
    try {
      setAdding(true);
      const usersRef = ref(rtdb, "users");
      const newRef = push(usersRef);
      await set(newRef, {
        uid: newRef.key,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || "user",
        createdAt: serverTimestamp(),
      });
      // Optimistic update
      setUsers((prev) => [
        ...prev,
        {
          id: newRef.key,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role || "user",
          status: "Active",
          joined: new Date().toISOString().slice(0, 10),
        },
      ]);
      setNewUser({ name: "", email: "", role: "user" });
    } catch (e) {
      setError("Failed to add user.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">
          User Management
        </h2>
        <p className="text-sm text-slate-500">
          View and manage registered users of the platform.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700">
            All Users
          </h3>
          <p className="text-xs text-slate-500">
            For the project, you can explain how this will connect to backend
            APIs.
          </p>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button
            type="submit"
            disabled={adding}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add User"}
          </button>
          {error && (
            <p className="md:col-span-4 text-xs text-red-500">{error}</p>
          )}
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Joined</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : users).map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-800">{user.name}</td>
                  <td className="px-3 py-2 text-slate-600">{user.email}</td>
                  <td className="px-3 py-2 text-slate-600 capitalize">
                    {user.role}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{user.joined}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-xs text-brand-600 hover:underline mr-2"
                      onClick={() =>
                        alert("In full system this will open user details.")
                      }
                    >
                      View
                    </button>
                    <button
                      className="text-xs text-red-500 hover:underline"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-slate-500" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
