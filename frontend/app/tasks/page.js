"use client";

import { useCallback, useEffect, useState } from "react";

import Filters from "@/components/Filters";
import LangSwitch from "@/components/LangSwitch";
import Logo from "@/components/Logo";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import { api } from "@/lib/api";
import { PAGE_SIZE } from "@/lib/constants";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { useAuthGuard } from "@/lib/useAuthGuard";

const DEFAULT_FILTERS = { q: "", status: "", priority: "", sort: "-created_at" };

export default function TasksPage() {
  const { ready, user, logout } = useAuthGuard();
  const { t } = useI18n();
  useDocumentTitle("meta.tasks");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // окремий стан для пошуку з затримкою, щоб не слати запит на кожну літеру
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // null — вікно закрите, {} — створення, task — редагування
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(filters.q), 350);
    return () => clearTimeout(timer);
  }, [filters.q]);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await api.listTasks({
        q: debouncedQuery.trim(),
        status: filters.status,
        priority: filters.priority,
        sort: filters.sort,
        limit: PAGE_SIZE,
        offset,
      });

      // видалили останню задачу на сторінці: повертаємось на попередню
      if (result.items.length === 0 && result.total > 0 && offset > 0) {
        setOffset(Math.max(0, offset - PAGE_SIZE));
        return;
      }
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters.status, filters.priority, filters.sort, offset]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  function handleFiltersChange(next) {
    setFilters(next);
    setOffset(0);
  }

  function handleSaved() {
    setEditing(null);
    load();
  }

  async function handleStatusChange(task, status) {
    try {
      await api.updateTask(task.id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setDeleteError("");
    try {
      await api.deleteTask(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  const hasFilters = filters.q || filters.status || filters.priority;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
          )}
          <LangSwitch />
          <button type="button" onClick={logout} className="btn btn-outline">
            {t("tasks.logout")}
          </button>
        </div>
      </header>

      <div className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("tasks.title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? t("tasks.loading") : t("tasks.total", { count: data.total })}
          </p>
        </div>
        <button type="button" onClick={() => setEditing({})} className="btn btn-primary">
          {t("tasks.new")}
        </button>
      </div>

      <Filters filters={filters} onChange={handleFiltersChange} />

      {error && (
        <div
          className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger"
          role="alert"
        >
          <span>{error}</span>
          <button type="button" onClick={load} className="font-semibold underline">
            {t("tasks.retry")}
          </button>
        </div>
      )}

      <section className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-line/60" />
            ))}
          </div>
        ) : data.items.length === 0 && !error ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
            <p className="text-lg font-semibold">
              {hasFilters ? t("tasks.nothingFound") : t("tasks.noTasks")}
            </p>
            <p className="mt-1 text-sm text-muted">
              {hasFilters ? t("tasks.nothingFoundHint") : t("tasks.noTasksHint")}
            </p>
            {!hasFilters && (
              <button
                type="button"
                onClick={() => setEditing({})}
                className="btn btn-primary mt-6"
              >
                {t("tasks.new")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setEditing}
                onStatusChange={handleStatusChange}
                onDelete={(t) => {
                  setDeleteError("");
                  setDeleting(t);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Pagination
        offset={offset}
        limit={PAGE_SIZE}
        total={data.total}
        onChange={setOffset}
      />

      {editing && (
        <Modal
          title={editing.id ? t("tasks.editTitle") : t("tasks.newTitle")}
          onClose={() => setEditing(null)}
        >
          <TaskForm
            task={editing.id ? editing : null}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title={t("tasks.deleteTitle")} onClose={() => setDeleting(null)}>
          <p className="text-sm text-muted">
            {t("tasks.deleteBefore")}
            <span className="font-semibold text-ink">{deleting.title}</span>
            {t("tasks.deleteAfter")}
          </p>
          {deleteError && (
            <p className="mt-3 text-sm text-danger" role="alert">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="btn btn-ghost"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={busy}
              className="btn btn-danger"
            >
              {busy ? t("tasks.deleting") : t("common.delete")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
