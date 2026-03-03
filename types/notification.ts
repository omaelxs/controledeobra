export interface NotificationDoc {
  id?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  createdAt: string;
  createdBy: string;
  createdByEmail: string;
  readBy: string[];
}
