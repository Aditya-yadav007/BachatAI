// Firestore-backed transactions

const getUid = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const u = JSON.parse(raw);
    return u?.uid || null;
  } catch {
    return null;
  }
};

export const getTransactions = async () => {
  const { rtdb } = await import("../firebase/firebase");
  const { ref, get, child } = await import("firebase/database");

  const uid = getUid();
  if (!uid) throw new Error("Not authenticated");

  // Read statements root and pick the most recent statement
  const stmtsSnap = await get(child(ref(rtdb), `users/${uid}/Statements`));
  if (!stmtsSnap.exists()) return [];
  const stmts = stmtsSnap.val() || {};
  const stmtKeys = Object.keys(stmts);
  if (stmtKeys.length === 0) return [];

  // Choose most recent by uploadedAt (numeric) fallback to last key
  let chosenKey = stmtKeys[stmtKeys.length - 1];
  let maxTs = -Infinity;
  for (const k of stmtKeys) {
    const ts = stmts[k]?.uploadedAt;
    if (typeof ts === "number" && ts > maxTs) {
      maxTs = ts;
      chosenKey = k;
    }
  }

  const stmt = stmts[chosenKey] || {};
  const rows = Array.isArray(stmt.rows)
    ? stmt.rows
    : Array.isArray(stmt.sampleRows)
    ? stmt.sampleRows
    : [];

  // Map generic rows into transaction-like structure
  const normalize = (s = "") => String(s).trim().toLowerCase();
  const mapRowToTx = (row, idx) => {
    const keys = Object.keys(row || {});
    const lookup = (name) => {
      const n = normalize(name);
      const key = keys.find((k) => normalize(k) === n);
      return key ? row[key] : undefined;
    };
    const date = lookup("date") || lookup("txn_date") || lookup("transaction_date") || "";
    const type = (lookup("type") || lookup("txn_type") || "Expense").toString();
    const category = lookup("category") || "Other";
    const amountRaw = lookup("amount") || lookup("debit") || lookup("credit");
    let amount = Number(String(amountRaw || "").replace(/[^0-9.-]/g, ""));
    if (!isFinite(amount)) amount = 0;
    const description = lookup("description") || lookup("narration") || "";
    return { id: `${chosenKey}_${idx}`, date, type, category, amount, description };
  };

  const list = rows.map((r, i) => mapRowToTx(r, i));
  const toKey = (d) => (typeof d === "string" ? d : "");
  list.sort((a, b) => toKey(b.date).localeCompare(toKey(a.date)));
  return list;
};

export const addTransaction = async (payload) => {
  const { rtdb } = await import("../firebase/firebase");
  const { ref, push, set, serverTimestamp } = await import("firebase/database");

  const uid = getUid();
  if (!uid) throw new Error("Not authenticated");

  // Normalize date to YYYY-MM-DD string
  let date = payload.date;
  if (date instanceof Date) {
    date = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  const txRef = push(ref(rtdb, `users/${uid}/transactions`));
  const record = {
    ...payload,
    date: typeof date === "string" ? date : "",
    userId: uid,
    createdAt: serverTimestamp(),
  };
  await set(txRef, record);
  return { id: txRef.key, ...record };
};

export const deleteTransaction = async (id) => {
  const { rtdb } = await import("../firebase/firebase");
  const { ref, remove } = await import("firebase/database");

  const uid = getUid();
  if (!uid) throw new Error("Not authenticated");

  await remove(ref(rtdb, `users/${uid}/transactions/${id}`));
  return { message: "Transaction deleted" };
};
