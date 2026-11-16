"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getToken } from "@/lib/auth";

// Головна сторінка нічого не показує: просто направляє
// залогіненого користувача до задач, а решту на вхід.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/tasks" : "/login");
  }, [router]);

  return null;
}
