"use client";

import { useEffect } from "react";

import { useI18n } from "@/lib/i18n";

// Просте модальне вікно: закривається по Esc і кліку на фон
export default function Modal({ title, onClose, children }) {
  const { t } = useI18n();

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    // не даємо сторінці прокручуватись під вікном
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost -mr-2 !px-2.5 !py-1.5"
            aria-label={t("common.close")}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
