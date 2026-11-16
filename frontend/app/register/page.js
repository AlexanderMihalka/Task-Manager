import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Реєстрація | Менеджер задач" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
