import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp | Date | null;
  updatedAt: Timestamp | Date | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
}

export type TaskFilter = 'all' | 'pending' | 'completed';

