const appConfig = {
  appName: "Bachat AI",
  tagline: "Smart AI-powered personal finance assistant",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",

  currencySymbol: "₹",
  defaultMonthFormat: "MMM yyyy",

  // colors / theming tokens
  theme: {
    primary: "brand-500",
    primaryDark: "brand-600",
  },
};

export default appConfig;
