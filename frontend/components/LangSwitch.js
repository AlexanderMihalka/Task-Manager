"use client";

import { LANGS, useI18n } from "@/lib/i18n";

// Маленький перемикач мови: UK | EN
export default function LangSwitch() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className="inline-flex rounded-xl border border-line bg-surface p-0.5"
      role="group"
      aria-label={t("common.language")}
    >
      {LANGS.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(code)}
            className={`cursor-pointer rounded-[10px] px-2.5 py-1.5 text-xs font-bold uppercase transition ${
              active ? "bg-primary-soft text-primary" : "text-muted hover:text-ink"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
