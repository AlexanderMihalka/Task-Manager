import { LanguageProvider } from "@/lib/i18n";

import "./globals.css";

export const metadata = {
  title: "Менеджер задач",
  description: "Простий застосунок для керування особистими задачами",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
