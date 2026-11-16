import { clearToken, getToken } from "./auth";
import { translate, translateServerMessage } from "./i18n";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // помилки по полях форми: { email: "...", password: "..." }
    this.fields = fields;
  }
}

// Pydantic повертає повідомлення англійською, тому перекладаємо найчастіші.
// Текст помилки формується в момент запиту, тож після перемикання мови
// вже показана помилка лишиться старою мовою, поки її не оновить новий запит.
function translateValidation(item, field) {
  const { type, msg, ctx } = item;
  if (field === "email" && type !== "missing") return translate("auth.invalidEmail");

  switch (type) {
    case "missing":
      return translate("validation.required");
    case "string_too_short":
      return ctx?.min_length === 1
        ? translate("validation.empty")
        : translate("validation.minLength", { n: ctx?.min_length });
    case "string_too_long":
      return translate("validation.maxLength", { n: ctx?.max_length });
    case "value_error":
      return String(msg).replace(/^Value error, /, "");
    default:
      return msg;
  }
}

function buildError(status, data) {
  const detail = data?.detail;

  // 422: список помилок валідації
  if (Array.isArray(detail)) {
    const fields = {};
    for (const item of detail) {
      const field = Array.isArray(item.loc) ? String(item.loc.at(-1)) : "_";
      if (!fields[field]) fields[field] = translateValidation(item, field);
    }
    return new ApiError(translate("validation.fixInput"), status, fields);
  }

  // 400, 401, 403, 404: короткий текст
  if (typeof detail === "string")
    return new ApiError(translateServerMessage(detail), status);

  return new ApiError(translate("error.generic"), status);
}

async function request(path, { method = "GET", body, params, auth = true } = {}) {
  const url = new URL(API_URL + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== "" && value != null) url.searchParams.set(key, value);
    }
  }

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(translate("error.network"), 0);
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    // токен недійсний або прострочений: виходимо на сторінку входу
    if (response.status === 401 && auth) {
      clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    throw buildError(response.status, data);
  }

  return data;
}

export const api = {
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: { email, password }, auth: false }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  me: () => request("/auth/me"),

  listTasks: (params) => request("/tasks", { params }),

  createTask: (values) => request("/tasks", { method: "POST", body: values }),

  updateTask: (id, values) =>
    request(`/tasks/${id}`, { method: "PATCH", body: values }),

  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};
