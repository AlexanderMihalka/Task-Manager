"use client";

import { useI18n } from "@/lib/i18n";

export default function Pagination({ offset, limit, total, onChange }) {
  const { t } = useI18n();
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));

  if (pages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-4" aria-label={t("pagination.label")}>
      <button
        type="button"
        className="btn btn-outline"
        disabled={page <= 1}
        onClick={() => onChange((page - 2) * limit)}
      >
        {t("pagination.prev")}
      </button>
      <span className="text-sm text-muted">
        {t("pagination.page", { page, pages })}
      </span>
      <button
        type="button"
        className="btn btn-outline"
        disabled={page >= pages}
        onClick={() => onChange(page * limit)}
      >
        {t("pagination.next")}
      </button>
    </nav>
  );
}
