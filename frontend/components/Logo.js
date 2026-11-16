"use client";

import { useI18n } from "@/lib/i18n";

export default function Logo({ size = "md" }) {
  const { t } = useI18n();
  const box = size === "lg" ? "h-12 w-12 rounded-2xl" : "h-9 w-9 rounded-xl";
  const icon = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className="flex items-center gap-3">
      <span className={`${box} flex items-center justify-center bg-primary`}>
        <svg
          viewBox="0 0 24 24"
          className={`${icon} text-white`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className={`font-bold ${size === "lg" ? "text-2xl" : "text-lg"}`}>
        {t("app.name")}
      </span>
    </div>
  );
}
