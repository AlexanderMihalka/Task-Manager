"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import Field from "./Field";
import LangSwitch from "./LangSwitch";
import Logo from "./Logo";

// Одна форма на дві сторінки: вхід і реєстрація майже однакові
export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const { t } = useI18n();
  useDocumentTitle(isRegister ? "meta.register" : "meta.login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = t("auth.enterEmail");
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      errors.email = t("auth.invalidEmail");

    if (!password) errors.password = t("auth.enterPassword");
    else if (isRegister && password.length < 8)
      errors.password = t("auth.passwordShort");

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const cleanEmail = email.trim();
      if (isRegister) {
        await api.register(cleanEmail, password);
      }
      // після реєстрації одразу входимо, щоб не змушувати вводити все вдруге
      const { access_token } = await api.login(cleanEmail, password);
      setToken(access_token);
      router.replace("/tasks");
    } catch (err) {
      setFieldErrors(err.fields || {});
      setFormError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute top-4 right-4">
        <LangSwitch />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="rounded-3xl border border-line bg-surface p-7 shadow-[0_10px_40px_-18px_rgba(63,71,86,0.25)] sm:p-9">
          <h1 className="text-xl font-bold">
            {isRegister ? t("auth.titleRegister") : t("auth.titleLogin")}
          </h1>
          <p className="mt-1 mb-6 text-sm text-muted">
            {isRegister
              ? t("auth.subtitleRegister")
              : t("auth.subtitleLogin")}
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {formError && !Object.keys(fieldErrors).length && (
              <div
                className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger"
                role="alert"
              >
                {formError}
              </div>
            )}

            <Field label={t("auth.email")} htmlFor="email" error={fieldErrors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </Field>

            <Field
              label={t("auth.password")}
              htmlFor="password"
              error={fieldErrors.password}
              hint={isRegister ? t("auth.passwordHint") : undefined}
            >
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={Boolean(fieldErrors.password)}
              />
            </Field>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading
                ? t("auth.wait")
                : isRegister
                  ? t("auth.submitRegister")
                  : t("auth.submitLogin")}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {isRegister ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-primary hover:underline"
          >
            {isRegister ? t("auth.toLogin") : t("auth.toRegister")}
          </Link>
        </p>
      </div>
    </main>
  );
}
