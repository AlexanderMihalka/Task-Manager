// Підписи (labelKey) — це ключі зі словника в lib/i18n.js
export const PAGE_SIZE = 9;

export const STATUSES = [
  { value: "todo", labelKey: "status.todo" },
  { value: "in_progress", labelKey: "status.in_progress" },
  { value: "done", labelKey: "status.done" },
];

export const PRIORITIES = [
  { value: "low", labelKey: "priority.low" },
  { value: "medium", labelKey: "priority.medium" },
  { value: "high", labelKey: "priority.high" },
];

export const SORTS = [
  { value: "-created_at", labelKey: "sort.-created_at" },
  { value: "created_at", labelKey: "sort.created_at" },
  { value: "due_date", labelKey: "sort.due_date" },
  { value: "-due_date", labelKey: "sort.-due_date" },
];

// Tailwind бачить класи лише коли вони записані повністю,
// тому збираємо їх у словники, а не складаємо рядки на льоту
export const STATUS_STYLES = {
  todo: "bg-todo-bg text-todo-fg",
  in_progress: "bg-progress-bg text-progress-fg",
  done: "bg-done-bg text-done-fg",
};

export const PRIORITY_STYLES = {
  low: "bg-low-bg text-low-fg",
  medium: "bg-medium-bg text-medium-fg",
  high: "bg-high-bg text-high-fg",
};

// ключ перекладу для значення; самі підписи беремо через t()
export function labelKeyOf(list, value) {
  return list.find((item) => item.value === value)?.labelKey ?? value;
}
