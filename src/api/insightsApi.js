import axiosClient from "./axiosClient";

export const getInsightsSummary = async () => {
  const res = await axiosClient.get("/insights/summary");
  return res.data;
};

export const getMonthlyTrend = async () => {
  const res = await axiosClient.get("/insights/monthly-trend");
  return res.data;
};

export const getRecommendations = async () => {
  const res = await axiosClient.get("/insights/recommendations");
  return res.data;
};
