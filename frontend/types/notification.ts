export interface Notification {
  id: number;
  user_id: number;
  order_id?: number | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadNotificationCountResponse {
  unread_count: number;
}

export interface MarkAllReadResponse {
  message: string;
  count: number;
}

export interface WebSocketEvent {
  type: string;
  id?: number;
  title?: string;
  message?: string;
  notification_type?: string;
  order_id?: number | null;
  sound?: boolean;
  created_at?: string;
  user_id?: number;
  [key: string]: any;
}
