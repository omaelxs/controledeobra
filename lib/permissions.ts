import { UserRole } from "@/types/user";

export function isAdminOrDev(role: UserRole): boolean {
  return role === "admin" || role === "dev";
}

export function canCreate(role: UserRole): boolean {
  return isAdminOrDev(role);
}

export function canEdit(role: UserRole): boolean {
  return isAdminOrDev(role);
}

export function canDelete(role: UserRole): boolean {
  return isAdminOrDev(role);
}

export function canFillVistoria(role: UserRole): boolean {
  return true; // todos podem preencher vistoria
}

export function canAccessAdmin(role: UserRole): boolean {
  return isAdminOrDev(role);
}

export function assertPermission(role: UserRole | undefined, action: "create" | "edit" | "delete") {
  if (!role) throw new Error("Usuário não autenticado");
  const checks = { create: canCreate, edit: canEdit, delete: canDelete };
  if (!checks[action](role)) {
    throw new Error(`Permissão negada: usuários comuns não podem ${action === "create" ? "criar" : action === "edit" ? "editar" : "excluir"} este recurso`);
  }
}
