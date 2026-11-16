"use client";

import {
  PRIORITIES,
  PRIORITY_STYLES,
  STATUSES,
  STATUS_STYLES,
  labelKeyOf,
} from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";

function Badge({ className, children }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

// Швидка зміна статусу: три кнопки, активна підсвічена
function StatusSwitch({ current, onChange }) {
  const { t } = useI18n();

  return (
    <div
      className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-page p-1"
      role="group"
      aria-label={t("card.changeStatus")}
    >
      {STATUSES.map((s) => {
        const active = s.value === current;
        return (
          <button
            key={s.value}
            type="button"
            aria-pressed={active}
            disabled={active}
            onClick={() => onChange(s.value)}
            className={`cursor-pointer rounded-lg px-1 py-1.5 text-xs font-semibold transition ${
              active
                ? `${STATUS_STYLES[s.value]} cursor-default`
                : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            {t(s.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { t } = useI18n();
  const overdue = isOverdue(task);
  const done = task.status === "done";

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-[0_6px_24px_-16px_rgba(63,71,86,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(63,71,86,0.35)]">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className={STATUS_STYLES[task.status]}>
          {t(labelKeyOf(STATUSES, task.status))}
        </Badge>
        <Badge className={PRIORITY_STYLES[task.priority]}>
          {t(labelKeyOf(PRIORITIES, task.priority))}
        </Badge>
      </div>

      <h3
        className={`text-base font-bold break-words ${
          done ? "text-muted line-through decoration-muted/50" : ""
        }`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1.5 line-clamp-3 text-sm break-words whitespace-pre-line text-muted">
          {task.description}
        </p>
      )}

      <div className="mt-auto" />
      <StatusSwitch
        current={task.status}
        onChange={(status) => onStatusChange(task, status)}
      />

      <div className="flex items-center justify-between gap-3 pt-3">
        <div className="text-xs">
          {task.due_date ? (
            <span className={overdue ? "font-semibold text-danger" : "text-muted"}>
              {overdue ? t("card.overdue") : t("card.until")}
              {formatDate(task.due_date)}
            </span>
          ) : (
            <span className="text-muted/70">{t("card.noDeadline")}</span>
          )}
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="btn btn-ghost !px-3 !py-1.5"
          >
            {t("card.edit")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="btn btn-ghost !px-3 !py-1.5 hover:!bg-danger-bg hover:!text-danger"
          >
            {t("card.delete")}
          </button>
        </div>
      </div>
    </article>
  );
}
