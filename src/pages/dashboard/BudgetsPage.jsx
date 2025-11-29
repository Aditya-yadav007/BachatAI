import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import appConfig from "../../config/appConfig";
import {
  getCurrentBudget,
  updateMonthBudget,
  updateCategoryLimit,
} from "../../api/budgetApi";

// Data now comes from API

const BudgetsPage = () => {
  const [monthBudget, setMonthBudget] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    setLoading(true);
    const data = await getCurrentBudget();
    setMonthBudget(data.monthBudget);
    setCategories(data.categories || []);
    setLoading(false);
  };

  const totalCategoryLimit = categories.reduce(
    (sum, cat) => sum + Number(cat.limit || 0),
    0
  );
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = monthBudget - totalSpent;

  const handleMonthBudgetChange = async (e) => {
    const amount = Number(e.target.value) || 0;
    setMonthBudget(amount);
    await updateMonthBudget(amount);
  };

  const handleCategoryLimitChange = async (index, value) => {
    const limit = Number(value) || 0;
    const categoryName = categories[index]?.name;
    // optimistic UI update
    setCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, limit } : cat))
    );
    await updateCategoryLimit(categoryName, limit);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Budgets</h2>
        <p className="text-sm text-slate-500">
          Plan your monthly spending and keep track of category-wise limits.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Monthly Budget
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {appConfig.currencySymbol}
            {monthBudget.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Total amount you plan to spend this month.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Spent So Far
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {appConfig.currencySymbol}
            {totalSpent.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on current category-wise spending.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Remaining
          </p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              remaining >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {appConfig.currencySymbol}
            {remaining.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {remaining >= 0
              ? "You are within your planned budget."
              : "You have exceeded your monthly budget."}
          </p>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget settings */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Set Monthly Budget
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Total monthly budget ({appConfig.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={monthBudget}
                onChange={handleMonthBudgetChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">
                Tip from Bachat AI 🤖
              </p>
              <p>
                Try to keep your total category budgets slightly lower than your
                total monthly budget. This gives you a buffer for unexpected
                expenses.
              </p>
              <p className="mt-1">
                Current total of category limits:{" "}
                <span className="font-semibold">
                  {appConfig.currencySymbol}
                  {totalCategoryLimit.toLocaleString("en-IN")}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Category budgets */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Category-wise Budgets
          </h3>
          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : (
          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-2">
            {categories.map((cat, index) => {
              const usage = cat.limit
                ? Math.min((cat.spent / cat.limit) * 100, 150) // cap width a bit
                : 0;
              const isOver = cat.spent > cat.limit && cat.limit > 0;

              return (
                <div
                  key={cat.name}
                  className="border border-slate-100 rounded-lg p-3 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {cat.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Spent:{" "}
                        <span className="font-medium text-slate-700">
                          {appConfig.currencySymbol}
                          {cat.spent.toLocaleString("en-IN")}
                        </span>{" "}
                        / Limit:{" "}
                        <span className="font-medium text-slate-700">
                          {appConfig.currencySymbol}
                          {cat.limit.toLocaleString("en-IN")}
                        </span>
                      </p>
                    </div>

                    <div className="w-32">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        Limit ({appConfig.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cat.limit}
                        onChange={(e) =>
                          handleCategoryLimitChange(index, e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Usage</span>
                      <span
                        className={
                          isOver ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {cat.limit > 0
                          ? `${Math.round(
                              (cat.spent / cat.limit) * 100
                            )}% of limit`
                          : "No limit set"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isOver ? "bg-red-500" : "bg-brand-500"
                        }`}
                        style={{ width: `${usage}%` }}
                      ></div>
                    </div>

                    {isOver && (
                      <p className="mt-1 text-[11px] text-red-600">
                        You have exceeded your budget for {cat.name}. Try to cut
                        down spending here next week.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BudgetsPage;
