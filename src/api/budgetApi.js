import axiosClient from "./axiosClient";

export const getCurrentBudget = async () => {
  const res = await axiosClient.get("/budgets/current");
  return res.data;
};

export const updateMonthBudget = async (amount) => {
  const res = await axiosClient.post("/budgets", { monthBudget: amount });
  return res.data;
};

export const updateCategoryLimit = async (name, limit) => {
  const res = await axiosClient.post("/budgets/category", {
    name,
    limit,
  });
  return res.data;
};
