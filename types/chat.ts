export interface ChatMessage {
  id?: string;
  userId: string;
  userEmail: string;
  displayName: string;
  photoURL: string | null;
  text: string;
  timestamp: string;
}
