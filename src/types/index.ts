export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  userId: string;
  color?: string;
  reminderEnabled?: boolean;
  reminderMinutes?: number;
  isShared?: boolean;
  sharedWith?: string[];
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}