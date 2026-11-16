"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Усі тексти інтерфейсу живуть тут. Бібліотеку для i18n не підключаємо:
// для двох мов і кількох десятків рядків це було б надто важко.

const LANG_KEY = "tm_lang";
export const LANGS = ["uk", "en"];
const DEFAULT_LANG = "uk";

const messages = {
  uk: {
    "app.name": "Менеджер задач",
    "meta.login": "Вхід | Менеджер задач",
    "meta.register": "Реєстрація | Менеджер задач",
    "meta.tasks": "Мої задачі | Менеджер задач",

    "common.cancel": "Скасувати",
    "common.close": "Закрити",
    "common.delete": "Видалити",
    "common.language": "Мова",

    "status.todo": "До виконання",
    "status.in_progress": "В роботі",
    "status.done": "Виконано",
    "priority.low": "Низький",
    "priority.medium": "Середній",
    "priority.high": "Високий",
    "sort.-created_at": "Спочатку нові",
    "sort.created_at": "Спочатку старі",
    "sort.due_date": "Дедлайн: найближчі",
    "sort.-due_date": "Дедлайн: найдальші",

    "auth.titleRegister": "Створити акаунт",
    "auth.titleLogin": "З поверненням",
    "auth.subtitleRegister": "Кілька секунд, і можна додавати задачі.",
    "auth.subtitleLogin": "Увійдіть, щоб побачити свої задачі.",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.passwordHint": "Щонайменше 8 символів",
    "auth.enterEmail": "Введіть email",
    "auth.invalidEmail": "Введіть коректний email",
    "auth.enterPassword": "Введіть пароль",
    "auth.passwordShort": "Пароль має містити щонайменше 8 символів",
    "auth.wait": "Зачекайте...",
    "auth.submitRegister": "Зареєструватися",
    "auth.submitLogin": "Увійти",
    "auth.haveAccount": "Вже є акаунт?",
    "auth.noAccount": "Ще немає акаунта?",
    "auth.toLogin": "Увійти",
    "auth.toRegister": "Зареєструватися",

    "tasks.title": "Мої задачі",
    "tasks.loading": "Завантаження...",
    "tasks.total": "Усього: {count}",
    "tasks.new": "+ Нова задача",
    "tasks.logout": "Вийти",
    "tasks.retry": "Спробувати знову",
    "tasks.nothingFound": "Нічого не знайдено",
    "tasks.noTasks": "Поки що немає задач",
    "tasks.nothingFoundHint": "Спробуйте змінити пошук або фільтри.",
    "tasks.noTasksHint": "Додайте першу задачу, щоб почати.",
    "tasks.editTitle": "Редагування задачі",
    "tasks.newTitle": "Нова задача",
    "tasks.deleteTitle": "Видалити задачу?",
    "tasks.deleteBefore": "Задача «",
    "tasks.deleteAfter": "» буде видалена назавжди.",
    "tasks.deleting": "Видалення...",

    "filters.search": "Пошук за назвою",
    "filters.searchPlaceholder": "Пошук за назвою...",
    "filters.status": "Статус",
    "filters.allStatuses": "Усі статуси",
    "filters.priority": "Пріоритет",
    "filters.allPriorities": "Усі пріоритети",
    "filters.sort": "Сортування",

    "pagination.label": "Сторінки",
    "pagination.prev": "← Назад",
    "pagination.next": "Далі →",
    "pagination.page": "Сторінка {page} з {pages}",

    "card.changeStatus": "Змінити статус",
    "card.overdue": "Прострочено · ",
    "card.until": "До ",
    "card.noDeadline": "Без дедлайну",
    "card.edit": "Змінити",
    "card.delete": "Видалити",

    "form.title": "Назва",
    "form.titlePlaceholder": "Що потрібно зробити?",
    "form.titleRequired": "Введіть назву задачі",
    "form.description": "Опис",
    "form.descriptionPlaceholder": "Деталі (необов'язково)",
    "form.status": "Статус",
    "form.priority": "Пріоритет",
    "form.dueDate": "Дедлайн",
    "form.saving": "Збереження...",
    "form.save": "Зберегти",
    "form.create": "Створити",

    "validation.fixInput": "Перевірте правильність введених даних",
    "validation.required": "Це поле обов'язкове",
    "validation.empty": "Це поле не може бути порожнім",
    "validation.minLength": "Мінімум символів: {n}",
    "validation.maxLength": "Максимум символів: {n}",

    "error.network": "Не вдалося з'єднатися із сервером. Перевірте, чи запущено API.",
    "error.generic": "Щось пішло не так. Спробуйте ще раз",
    // відповіді API (бекенд повертає їх українською, тут вони мають переклад)
    "server.emailTaken": "Користувач з таким email вже існує",
    "server.badCredentials": "Невірний email або пароль",
    "server.taskNotFound": "Задачу не знайдено",
    "server.notOwner": "Ця задача належить іншому користувачу",
    "server.emptyUpdate": "Не передано жодного поля для оновлення",
    "server.unauthorized": "Потрібна авторизація або токен недійсний",
  },

  en: {
    "app.name": "Task Manager",
    "meta.login": "Sign in | Task Manager",
    "meta.register": "Sign up | Task Manager",
    "meta.tasks": "My tasks | Task Manager",

    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.delete": "Delete",
    "common.language": "Language",

    "status.todo": "To do",
    "status.in_progress": "In progress",
    "status.done": "Done",
    "priority.low": "Low",
    "priority.medium": "Medium",
    "priority.high": "High",
    "sort.-created_at": "Newest first",
    "sort.created_at": "Oldest first",
    "sort.due_date": "Deadline: soonest",
    "sort.-due_date": "Deadline: latest",

    "auth.titleRegister": "Create an account",
    "auth.titleLogin": "Welcome back",
    "auth.subtitleRegister": "It takes a few seconds, then you can add tasks.",
    "auth.subtitleLogin": "Sign in to see your tasks.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.passwordHint": "At least 8 characters",
    "auth.enterEmail": "Enter your email",
    "auth.invalidEmail": "Enter a valid email",
    "auth.enterPassword": "Enter your password",
    "auth.passwordShort": "Password must be at least 8 characters long",
    "auth.wait": "Please wait...",
    "auth.submitRegister": "Sign up",
    "auth.submitLogin": "Sign in",
    "auth.haveAccount": "Already have an account?",
    "auth.noAccount": "Don't have an account yet?",
    "auth.toLogin": "Sign in",
    "auth.toRegister": "Sign up",

    "tasks.title": "My tasks",
    "tasks.loading": "Loading...",
    "tasks.total": "Total: {count}",
    "tasks.new": "+ New task",
    "tasks.logout": "Log out",
    "tasks.retry": "Try again",
    "tasks.nothingFound": "Nothing found",
    "tasks.noTasks": "No tasks yet",
    "tasks.nothingFoundHint": "Try changing the search or filters.",
    "tasks.noTasksHint": "Add your first task to get started.",
    "tasks.editTitle": "Edit task",
    "tasks.newTitle": "New task",
    "tasks.deleteTitle": "Delete this task?",
    "tasks.deleteBefore": "The task “",
    "tasks.deleteAfter": "” will be deleted permanently.",
    "tasks.deleting": "Deleting...",

    "filters.search": "Search by title",
    "filters.searchPlaceholder": "Search by title...",
    "filters.status": "Status",
    "filters.allStatuses": "All statuses",
    "filters.priority": "Priority",
    "filters.allPriorities": "All priorities",
    "filters.sort": "Sort by",

    "pagination.label": "Pages",
    "pagination.prev": "← Previous",
    "pagination.next": "Next →",
    "pagination.page": "Page {page} of {pages}",

    "card.changeStatus": "Change status",
    "card.overdue": "Overdue · ",
    "card.until": "Due ",
    "card.noDeadline": "No deadline",
    "card.edit": "Edit",
    "card.delete": "Delete",

    "form.title": "Title",
    "form.titlePlaceholder": "What needs to be done?",
    "form.titleRequired": "Enter a task title",
    "form.description": "Description",
    "form.descriptionPlaceholder": "Details (optional)",
    "form.status": "Status",
    "form.priority": "Priority",
    "form.dueDate": "Deadline",
    "form.saving": "Saving...",
    "form.save": "Save",
    "form.create": "Create",

    "validation.fixInput": "Please check the data you entered",
    "validation.required": "This field is required",
    "validation.empty": "This field can't be empty",
    "validation.minLength": "Minimum characters: {n}",
    "validation.maxLength": "Maximum characters: {n}",

    "error.network": "Couldn't reach the server. Check that the API is running.",
    "error.generic": "Something went wrong. Please try again",
    "server.emailTaken": "A user with this email already exists",
    "server.badCredentials": "Incorrect email or password",
    "server.taskNotFound": "Task not found",
    "server.notOwner": "This task belongs to another user",
    "server.emptyUpdate": "No fields were provided to update",
    "server.unauthorized": "Authorization required or the token is invalid",
  },
};

// Поточна мова дублюється в змінній модуля, щоб її могли читати
// не лише компоненти, а й api.js та dates.js (там хуків немає).
let currentLang = DEFAULT_LANG;

export function getLang() {
  return currentLang;
}

export function translate(key, params) {
  let text = messages[currentLang][key] ?? messages[DEFAULT_LANG][key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

// Бекенд повертає тексти помилок українською. Якщо такий текст нам відомий,
// підставляємо переклад на поточну мову, інакше показуємо як є.
const serverKeyByText = Object.fromEntries(
  Object.entries(messages.uk)
    .filter(([key]) => key.startsWith("server."))
    .map(([key, text]) => [text, key])
);

export function translateServerMessage(text) {
  const key = serverKeyByText[text];
  return key ? translate(key) : text;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  // Читаємо збережену мову вже після першого рендера, інакше
  // сервер і браузер відрендерять різний текст (помилка гідрації).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (saved && LANGS.includes(saved)) {
        currentLang = saved;
        setLangState(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!LANGS.includes(next)) return;
    currentLang = next;
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {}
  }, []);

  // змінюється разом із lang, тож компоненти перемальовуються при перемиканні
  const value = useMemo(
    () => ({ lang, setLang, t: (key, params) => translate(key, params) }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n має використовуватись усередині LanguageProvider");
  return ctx;
}

// Заголовок вкладки браузера. Метадані Next.js статичні, тому
// після перемикання мови оновлюємо title самі.
export function useDocumentTitle(key) {
  const { lang } = useI18n();
  useEffect(() => {
    document.title = translate(key);
  }, [key, lang]);
}
