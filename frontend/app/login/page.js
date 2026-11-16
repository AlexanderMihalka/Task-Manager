import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Вхід | Менеджер задач" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
