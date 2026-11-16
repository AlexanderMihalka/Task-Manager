"use client";

import { PRIORITIES, SORTS, STATUSES } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

export default function Filters({ filters, onChange }) {
  const { t } = useI18n();

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
      <input
        type="search"
        className="input"
        placeholder={t("filters.searchPlaceholder")}
        value={filters.q}
        onChange={(e) => set("q", e.target.value)}
        aria-label={t("filters.search")}
      />

      <select
        className="input lg:w-44"
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        aria-label={t("filters.status")}
      >
        <option value="">{t("filters.allStatuses")}</option>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {t(s.labelKey)}
          </option>
        ))}
      </select>

      <select
        className="input lg:w-44"
        value={filters.priority}
        onChange={(e) => set("priority", e.target.value)}
        aria-label={t("filters.priority")}
      >
        <option value="">{t("filters.allPriorities")}</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {t(p.labelKey)}
          </option>
        ))}
      </select>

      <select
        className="input lg:w-52"
        value={filters.sort}
        onChange={(e) => set("sort", e.target.value)}
        aria-label={t("filters.sort")}
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {t(s.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
