"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminOrDev, role } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (role && !isAdminOrDev) router.push("/dashboard");
  }, [role, isAdminOrDev, router]);

  if (!isAdminOrDev) return null;

  return <>{children}</>;
}
