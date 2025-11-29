import axios from "axios";
import appConfig from "../config/appConfig";

const axiosClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
