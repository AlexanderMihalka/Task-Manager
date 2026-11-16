"use client";

import { useState } from "react";

import { api } from "@/lib/api";
import { PRIORITIES, STATUSES } from "@/lib/constants";
import { fromDateInputValue, toDateInputValue } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import Field from "./Field";

// Створення й редагування в одній формі: якщо передано task, то редагуємо
export default function TaskForm({ task, onSaved, onCancel }) {
  const { t } = useI18n();
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? "todo");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.due_date));

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFieldErrors({ title: t("form.titleRequired") });
      return;
    }
    setFieldErrors({});

    const values = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: fromDateInputValue(dueDate),
    };

    setSaving(true);
    try {
      const saved = isEdit
        ? await api.updateTask(task.id, values)
        : await api.createTask(values);
      onSaved(saved);
    } catch (err) {
      setFieldErrors(err.fields || {});
      setFormError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && !Object.keys(fieldErrors).length && (
        <div className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger" role="alert">
          {formError}
        </div>
      )}

      <Field label={t("form.title")} htmlFor="title" error={fieldErrors.title}>
        <input
          id="title"
          className="input"
          value={title}
          maxLength={200}
          autoFocus
          placeholder={t("form.titlePlaceholder")}
          onChange={(e) => {
            setTitle(e.target.value);
            // помилка зникає, щойно людина почала виправляти поле
            setFieldErrors((prev) => ({ ...prev, title: undefined }));
          }}
          aria-invalid={Boolean(fieldErrors.title)}
        />
      </Field>

      <Field label={t("form.description")} htmlFor="description" error={fieldErrors.description}>
        <textarea
          id="description"
          className="input min-h-24 resize-y"
          value={description}
          maxLength={5000}
          placeholder={t("form.descriptionPlaceholder")}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("form.status")} htmlFor="status">
          <select
            id="status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {t(s.labelKey)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("form.priority")} htmlFor="priority">
          <select
            id="priority"
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {t(p.labelKey)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t("form.dueDate")} htmlFor="due_date" error={fieldErrors.due_date}>
        <input
          id="due_date"
          type="date"
          className="input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? t("form.saving") : isEdit ? t("form.save") : t("form.create")}
        </button>
      </div>
    </form>
  );
}
