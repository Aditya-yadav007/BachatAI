import Card from "../../components/ui/Card";
import appConfig from "../../config/appConfig";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getInsightsSummary,
  getMonthlyTrend,
  getRecommendations,
} from "../../api/insightsApi";

const InsightsPage = () => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    const s = await getInsightsSummary();
    const t = await getMonthlyTrend();
    const r = await getRecommendations();
    setSummary(s);
    setTrend(Array.isArray(t) ? t : []);
    setRecs(Array.isArray(r) ? r : []);
    setLoading(false);
  };

  const savingsRate = summary?.currentMonthIncome
    ? Math.round((summary.predictedSavings / summary.currentMonthIncome) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Insights</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI-generated view of your spending patterns, forecasts and
          personalised recommendations.
        </p>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Current Month Income
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {appConfig.currencySymbol}
            {(summary?.currentMonthIncome ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Total income recorded so far.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Current Month Expenses
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {appConfig.currencySymbol}
            {(summary?.currentMonthExpenses ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Based on your transactions till today.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Predicted Month-End Expenses
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {appConfig.currencySymbol}
            {(summary?.predictedMonthEndExpense ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Estimated by Bachat AI using your past 6 months.
          </p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Expected Savings & Risk Profile
          </p>
          <p className="mt-2 text-xl font-semibold text-emerald-600">
            {appConfig.currencySymbol}
            {(summary?.predictedSavings ?? 0).toLocaleString("en-IN")} {" "}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              ({savingsRate}% of income)
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Risk profile:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {summary?.riskProfile || "-"}
            </span>
          </p>
        </Card>
      </div>

      {/* Trend chart + recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
            Income vs Expenses Trend (with forecast)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Bachat AI compares your last few months with next month's
            prediction (marked with *) to help you understand how your
            spending is evolving.
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI recommendations */}
        <Card>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
            Bachat AI Recommendations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Generated using your spending pattern, savings trend and risk
            profile.
          </p>

          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {recs.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 text-brand-500 text-xs">●</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
            Note: These are generic suggestions for demo purposes. In the
            full system, this block will be powered by your ML models and
            real transaction data.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InsightsPage;
