const TOKEN_KEY = "planora-token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
};

export const isLoggedIn = () => !!getToken();

export const logout = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
};