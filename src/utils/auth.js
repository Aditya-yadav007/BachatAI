export const getCurrentUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === "admin";
};
