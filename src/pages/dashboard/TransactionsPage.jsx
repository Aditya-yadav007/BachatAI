import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import appConfig from "../../config/appConfig";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
} from "../../api/transactionsApi";
import { getCurrentUser } from "../../utils/auth";
import { rtdb } from "../../firebase/firebase";
import { ref, set as rSet, push, get, child, serverTimestamp } from "firebase/database";

// Transactions are now loaded from API

const categories = [
  "Salary",
  "Food",
  "Rent",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Other",
];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    date: "",
    type: "Expense",
    category: "Food",
    amount: "",
    description: "",
  });

  const [uploading, setUploading] = useState(false);
  const [statementHeaders, setStatementHeaders] = useState([]);
  const [statementRows, setStatementRows] = useState([]);
  const [lastStatementId, setLastStatementId] = useState("");
  const [importing, setImporting] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (s = "") => String(s).trim().toLowerCase();
  const mapRowToTx = (row) => {
    const keys = Object.keys(row);
    const lookup = (name) => {
      const n = normalize(name);
      const key = keys.find((k) => normalize(k) === n);
      return key ? row[key] : undefined;
    };
    const date = lookup("date") || lookup("txn_date") || lookup("transaction_date");
    const type = (lookup("type") || lookup("txn_type") || "Expense").toString();
    const category = lookup("category") || "Other";
    const amountRaw = lookup("amount") || lookup("debit") || lookup("credit");
    let amount = Number(String(amountRaw || "").replace(/[^0-9.-]/g, ""));
    if (!isFinite(amount)) amount = 0;
    const description = lookup("description") || lookup("narration") || "";
    return { date, type, category, amount, description };
  };

  const importStatementToTransactions = async (statementId) => {
    const stmtId = statementId || lastStatementId;
    if (!stmtId) return;
    const uid = getCurrentUser()?.uid;
    if (!uid) return;
    setImporting(true);
    setError("");
    try {
      // fetch the saved statement to get up to 1000 rows
      const stmtSnap = await get(child(ref(rtdb), `users/${uid}/Statements/${stmtId}`));
      if (!stmtSnap.exists()) throw new Error("Statement not found");
      const stmt = stmtSnap.val() || {};
      const rows = Array.isArray(stmt.rows) ? stmt.rows : Array.isArray(stmt.sampleRows) ? stmt.sampleRows : [];
      const limit = Math.min(rows.length, 200); // import at most 200 at a time for performance
      for (let i = 0; i < limit; i++) {
        const tx = mapRowToTx(rows[i] || {});
        if (!tx.date || !tx.amount) continue;
        await addTransaction(tx);
      }
      await loadTransactions();
    } catch (e) {
      setError("Failed to import rows into transactions. Check column names.");
    } finally {
      setImporting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.amount) return;
    const payload = { ...form, amount: Number(form.amount) };
    const newTx = await addTransaction(payload);
    setTransactions((prev) => [newTx, ...prev]);
    setForm((f) => ({ ...f, date: "", amount: "", description: "" }));
    setPage(0);
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const sortKey = (tx) => {
    if (sortBy === "amount") return Number(tx.amount || 0);
    if (sortBy === "type") return String(tx.type || "").toLowerCase();
    if (sortBy === "category") return String(tx.category || "").toLowerCase();
    // default date
    return String(tx.date || "");
  };
  const sortedTx = [...transactions].sort((a, b) => {
    const va = sortKey(a);
    const vb = sortKey(b);
    let cmp = 0;
    if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
    else cmp = String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });
  const total = sortedTx.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pages - 1);
  const start = currentPage * pageSize;
  const end = start + pageSize;
  const pagedTx = sortedTx.slice(start, end);

  const simpleParseCSV = (text) => {
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };
    const splitLine = (line) => {
      const out = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out.map((s) => s.trim());
    };
    const headers = splitLine(lines[0]);
    const rows = lines.slice(1).map((ln) => {
      const cols = splitLine(ln);
      const obj = {};
      headers.forEach((h, idx) => (obj[h || `col_${idx}`] = cols[idx] ?? ""));
      return obj;
    });
    return { headers, rows };
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const uid = getCurrentUser()?.uid;
      if (!uid) throw new Error("Not authenticated");
      const text = await file.text();

      const tempRef = ref(rtdb, `temp/${uid}/${Date.now()}`);
      await rSet(tempRef, {
        name: file.name,
        size: file.size,
        type: file.type || "text/csv",
        uploadedAt: serverTimestamp(),
        // store only a tiny snippet to avoid large payloads
        snippet: text.slice(0, 1000),
      });

      const { headers, rows } = simpleParseCSV(text);
      const statementsRoot = ref(rtdb, `users/${uid}/Statements`);
      const newStmtRef = push(statementsRoot);
      // Limit what we persist to avoid exceeding RTDB write limits
      const sampleCount = 200;
      const maxPersistRows = 1000;
      const sampleRows = rows.slice(0, sampleCount);
      const rowsToPersist = rows.slice(0, maxPersistRows);
      await rSet(newStmtRef, {
        id: newStmtRef.key,
        fileName: file.name,
        uploadedAt: serverTimestamp(),
        headers,
        rowCount: rows.length,
        sampleRows,
        // Persist at most 1000 rows to keep payloads reasonable
        rows: rowsToPersist,
      });

      setStatementHeaders(headers);
      setStatementRows(sampleRows);
      setLastStatementId(newStmtRef.key || "");
      // Auto-import a safe batch into transactions
      await importStatementToTransactions(newStmtRef.key);
    } catch (err) {
      setError("Failed to upload or parse the statement. If the file is very large, try a smaller subset.");
    } finally {
      setUploading(false);
      // reset input value to allow same file re-upload
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Transactions</h2>
        <p className="text-sm text-slate-500">
          Add and manage all your incomes and expenses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Add Transaction
          </h3>

          {error && (
            <p className="text-xs text-red-500 mb-2">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          {statementRows.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={importStatementToTransactions}
                disabled={importing}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-60"
              >
                {importing ? "Importing..." : "Import to Transactions"}
              </button>
              <span className="text-[11px] text-slate-500">Imports up to 200 rows from the uploaded statement.</span>
            </div>
          )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Amount ({appConfig.currencySymbol})
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g., Zomato order, petrol, movie"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition"
            >
              {loading ? "Saving..." : "Add Transaction"}
            </button>
          </form>
        </Card>

        {/* Transactions Table */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700">Recent Transactions</h3>
            <p className="text-xs text-slate-500">
              Total: <span className="font-semibold">{transactions.length}</span>
              {" "}• Page {currentPage + 1} of {pages}
            </p>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs font-medium text-slate-600">Upload Statement (CSV)</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelected}
              className="text-xs"
              disabled={uploading}
            />
            {uploading && (
              <span className="text-xs text-slate-500">Uploading...</span>
            )}
          </div>
          {/* Sort & Pagination Controls */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
            <div className="flex gap-2 items-center">
              <label className="text-xs text-slate-600">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="type">Type</option>
                <option value="category">Category</option>
              </select>
              <select
                value={sortDir}
                onChange={(e) => { setSortDir(e.target.value); setPage(0); }}
                className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-slate-600">Per page</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border border-slate-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Prev
              </button>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border border-slate-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={currentPage >= pages - 1}
              >
                Next
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      No transactions yet. Add your first one on the left.
                    </td>
                  </tr>
                ) : (
                  pagedTx.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2 text-slate-700">{tx.date}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            tx.type === "Income"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {tx.category}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {appConfig.currencySymbol}
                        {tx.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {tx.description || "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Statement Preview Table */}
        {statementRows.length > 0 && (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-700">Uploaded Statement Preview</h3>
              <p className="text-xs text-slate-500">Rows: {statementRows.length}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    {statementHeaders.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium">{h || `col_${i}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statementRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      {statementHeaders.map((h, i) => (
                        <td key={i} className="px-3 py-2 text-slate-700">{String(row[h || `col_${i}`] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
