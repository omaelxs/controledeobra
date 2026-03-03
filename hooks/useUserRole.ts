import { useUserContext } from "@/context/UserContext";
import { isAdminOrDev, canCreate, canEdit, canDelete, canAccessAdmin } from "@/lib/permissions";

export function useUserRole() {
  const { userDoc, role, loading } = useUserContext();

  return {
    userDoc,
    role,
    loading,
    isAdmin: role === "admin",
    isDev: role === "dev",
    isUser: role === "user",
    isAdminOrDev: isAdminOrDev(role),
    canCreate: canCreate(role),
    canEdit: canEdit(role),
    canDelete: canDelete(role),
    canAccessAdmin: canAccessAdmin(role),
  };
}
