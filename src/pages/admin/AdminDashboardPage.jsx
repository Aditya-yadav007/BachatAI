import Card from "../../components/ui/Card";
import appConfig from "../../config/appConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/firebase";
import { onValue, ref } from "firebase/database";

const initialStats = {
  totalUsers: 0,
  totalTransactions: 0,
  totalIncome: 0,
  totalExpenses: 0,
};

const systemTrendData = [
  { month: "Jun", totalExpenses: 520000 },
  { month: "Jul", totalExpenses: 560000 },
  { month: "Aug", totalExpenses: 580000 },
  { month: "Sep", totalExpenses: 600000 },
  { month: "Oct", totalExpenses: 620000 },
  { month: "Nov", totalExpenses: 645000 },
];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatNumber = (v) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      Number.isFinite(v) ? v : 0
    );

  useEffect(() => {
    let usersLoaded = false;
    let txLoaded = false;
    let incLoaded = false;
    let expLoaded = false;

    const usersRef = ref(rtdb, "users");
    const txRef = ref(rtdb, "transactions");
    const incomesRef = ref(rtdb, "incomes");
    const expensesRef = ref(rtdb, "expenses");

    const unsubUsers = onValue(
      usersRef,
      (snap) => {
        const val = snap.val() || {};
        const count = Object.keys(val).length;
        setStats((s) => ({ ...s, totalUsers: count }));
        usersLoaded = true;
        if (usersLoaded && txLoaded && incLoaded && expLoaded) setLoading(false);
      },
      (e) => {
        setError(e.message || "Failed to load users");
        setLoading(false);
      }
    );

    const unsubTx = onValue(
      txRef,
      (snap) => {
        const val = snap.val() || {};
        const list = Object.values(val);
        const count = list.length;
        setStats((s) => ({ ...s, totalTransactions: count }));
        txLoaded = true;
        if (usersLoaded && txLoaded && incLoaded && expLoaded) setLoading(false);
      },
      (e) => {
        setError(e.message || "Failed to load transactions");
        setLoading(false);
      }
    );

    const unsubIncome = onValue(
      incomesRef,
      (snap) => {
        const val = snap.val() || {};
        const list = Object.values(val);
        const sum = list.reduce((acc, item) => {
          const amt = typeof item?.amount === "number" ? item.amount : Number(item?.amount) || 0;
          return acc + amt;
        }, 0);
        setStats((s) => ({ ...s, totalIncome: sum }));
        incLoaded = true;
        if (usersLoaded && txLoaded && incLoaded && expLoaded) setLoading(false);
      },
      (e) => {
        setError(e.message || "Failed to load incomes");
        setLoading(false);
      }
    );

    const unsubExpenses = onValue(
      expensesRef,
      (snap) => {
        const val = snap.val() || {};
        const list = Object.values(val);
        const sum = list.reduce((acc, item) => {
          const amt = typeof item?.amount === "number" ? item.amount : Number(item?.amount) || 0;
          return acc + amt;
        }, 0);
        setStats((s) => ({ ...s, totalExpenses: sum }));
        expLoaded = true;
        if (usersLoaded && txLoaded && incLoaded && expLoaded) setLoading(false);
      },
      (e) => {
        setError(e.message || "Failed to load expenses");
        setLoading(false);
      }
    );

    return () => {
      try { typeof unsubUsers === "function" && unsubUsers(); } catch {}
      try { typeof unsubTx === "function" && unsubTx(); } catch {}
      try { typeof unsubIncome === "function" && unsubIncome(); } catch {}
      try { typeof unsubExpenses === "function" && unsubExpenses(); } catch {}
    };
  }, []);

  const { totalUsers, totalTransactions, totalIncome, totalExpenses } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Admin Dashboard
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          System-wide overview of all {appConfig.appName} users and activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Users
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {loading ? "—" : totalUsers}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Registered on the platform.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Transactions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {loading ? "—" : totalTransactions.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across all users.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Income (all users)
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {appConfig.currencySymbol}
            {loading ? "—" : totalIncome.toLocaleString("en-IN")}
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Expenses (all users)
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-300">
            {appConfig.currencySymbol}
            {loading ? "—" : totalExpenses.toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
          System-wide Expense Trend
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Shows how total monthly expenses (all users combined) are changing.
        </p>

        <div className="h-96 md:h-[28rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={systemTrendData} margin={{ top: 16, right: 24, bottom: 8, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis type="number" domain={[0, "auto"]} allowDecimals={false} tickCount={6} tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => `${appConfig.currencySymbol}${formatNumber(Number(value) || 0)}`} />
              <Line
                type="monotone"
                dataKey="totalExpenses"
                name="Total Expenses"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default AdminDashboardPage;
