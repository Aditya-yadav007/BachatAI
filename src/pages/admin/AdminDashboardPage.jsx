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

const dummySystemStats = {
  totalUsers: 128,
  totalTransactions: 3450,
  totalIncome: 5400000,
  totalExpenses: 3950000,
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
  const { totalUsers, totalTransactions, totalIncome, totalExpenses } =
    dummySystemStats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Admin Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          System-wide overview of all {appConfig.appName} users and activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Users
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {totalUsers}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Registered on the platform.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Transactions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {totalTransactions.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across all users.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Income (all users)
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {appConfig.currencySymbol}
            {totalIncome.toLocaleString("en-IN")}
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Expenses (all users)
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {appConfig.currencySymbol}
            {totalExpenses.toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          System-wide Expense Trend
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Shows how total monthly expenses (all users combined) are changing.
        </p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={systemTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
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
    </div>
  );
};

export default AdminDashboardPage;
