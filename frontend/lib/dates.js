import { getLang } from "./i18n";

// Дедлайн у формі вибирається як дата (без часу). У БД зберігаємо
// кінець цього дня за місцевим часом користувача, щоб задача не
// вважалась простроченою зранку в день дедлайну.

function pad(n) {
  return String(n).padStart(2, "0");
}

// ISO з API -> значення для <input type="date"> (YYYY-MM-DD, локальна дата)
export function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// значення <input type="date"> -> ISO для API
export function fromDateInputValue(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 0).toISOString();
}

const LOCALES = { uk: "uk-UA", en: "en-GB" };

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(LOCALES[getLang()] ?? "uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isOverdue(task) {
  return Boolean(
    task.due_date && task.status !== "done" && new Date(task.due_date) < new Date()
  );
}
