export type UserRole = "admin" | "dev" | "user";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  online: boolean;
  lastSeen: string;
  createdAt: string;
  obraIdPermitida?: string;
}
