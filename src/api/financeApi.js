import axiosClient from "./axiosClient";

const financeApi = {
  getOverview: () => axiosClient.get("/finance/overview"),
  getTransactions: (params) => axiosClient.get("/transactions", { params }),
  createTransaction: (payload) => axiosClient.post("/transactions", payload),
  getBudgets: () => axiosClient.get("/budgets"),
  getInsights: () => axiosClient.get("/insights"),
};

export default financeApi;
