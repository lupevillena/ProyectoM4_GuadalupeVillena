import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeToUserTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  toggleTaskComplete as apiToggleTaskComplete,
  deleteTask as apiDeleteTask,
} from '../services/taskService';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

export function useTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(() => Boolean(currentUser?.uid));
  const [error, setError] = useState<string | null>(null);

  // Suscripción en tiempo real con limpieza
  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) {
      return;
    }

    const unsubscribe = subscribeToUserTasks(
      uid,
      (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const addTask = useCallback(
    async (payload: CreateTaskPayload): Promise<void> => {
      if (!currentUser?.uid) {
        throw new Error('Debes iniciar sesión para crear una tarea.');
      }
      setError(null);
      await apiCreateTask(currentUser.uid, payload);
    },
    [currentUser]
  );

  const editTask = useCallback(
    async (taskId: string, payload: UpdateTaskPayload): Promise<void> => {
      setError(null);
      await apiUpdateTask(taskId, payload);
    },
    []
  );

  const toggleComplete = useCallback(
    async (taskId: string, currentCompleted: boolean): Promise<void> => {
      setError(null);
      await apiToggleTaskComplete(taskId, currentCompleted);
    },
    []
  );

  const removeTask = useCallback(async (taskId: string): Promise<void> => {
    setError(null);
    await apiDeleteTask(taskId);
  }, []);

  return {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    toggleComplete,
    removeTask,
    clearError: () => setError(null),
  };
}
