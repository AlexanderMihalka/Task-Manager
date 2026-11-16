// Токен лежить у localStorage. Для навчального проєкту це нормально,
// у проді варто розглянути httpOnly-cookie.

const TOKEN_KEY = "tm_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // приватний режим тощо: просто не збережемо
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {}
}
