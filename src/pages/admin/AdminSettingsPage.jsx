import { useState } from "react";
import Card from "../../components/ui/Card";

const AdminSettingsPage = () => {
  const [categories, setCategories] = useState([
    "Food",
    "Rent",
    "Shopping",
    "Transport",
    "Bills",
    "Entertainment",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) return;
    setCategories((prev) => [...prev, newCategory.trim()]);
    setNewCategory("");
  };

  const handleRemoveCategory = (cat) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">
          System Settings
        </h2>
        <p className="text-sm text-slate-500">
          Configure global options like expense categories for all users.
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          Manage Expense Categories (demo)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          In the real system, these categories would be stored in the database
          and used across all users.
        </p>

        <form
          onSubmit={handleAddCategory}
          className="flex flex-col sm:flex-row gap-2 mb-4"
        >
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add new category"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600"
          >
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700"
            >
              {cat}
              <button
                type="button"
                className="text-[11px] text-slate-500 hover:text-red-500"
                onClick={() => handleRemoveCategory(cat)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
