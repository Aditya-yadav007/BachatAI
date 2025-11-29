import textContent from "../../config/textContent";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const dummySummary = {
  income: 65000,
  expenses: 42000,
  savings: 23000,
};

const dummyCategoryData = [
  { name: "Food", value: 12000 },
  { name: "Rent", value: 15000 },
  { name: "Transport", value: 4000 },
  { name: "Shopping", value: 6000 },
  { name: "Others", value: 5000 },
];

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#e11d48", "#64748b"];

const OverviewPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {textContent.pages.dashboard.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {textContent.pages.dashboard.subtitle}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Income" value={dummySummary.income} />
        <StatCard label="Total Expenses" value={dummySummary.expenses} />
        <StatCard
          label="Savings"
          value={dummySummary.savings}
          subLabel="After all expenses"
        />
      </div>

      {/* Charts & insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
            {textContent.sections.spendingByCategoryTitle}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dummyCategoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  fill="#8884d8"
                  label
                >
                  {dummyCategoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
            {textContent.sections.upcomingAlertsTitle}
          </h3>
          <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
            <li>• You are close to your Food budget limit.</li>
            <li>• Try to reduce Shopping by 10% to increase savings.</li>
            <li>• Consider starting a SIP with ₹2000/month.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default OverviewPage;
