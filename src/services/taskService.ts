import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

const TASKS_COLLECTION = 'tasks';

/**
 * Convierte un Timestamp o fecha a milisegundos para ordenamiento seguro en el cliente.
 */
function getTimestampMillis(val: Timestamp | Date | null | undefined): number {
  if (!val) return 0;
  if (typeof (val as Timestamp).toMillis === 'function') {
    return (val as Timestamp).toMillis();
  }
  if (val instanceof Date) {
    return val.getTime();
  }
  return 0;
}

/**
 * Crea una nueva tarea asociada estrictamente al userId del usuario autenticado.
 */
export async function createTask(
  userId: string,
  payload: CreateTaskPayload
): Promise<string> {
  if (!userId) {
    throw new Error('No se puede crear una tarea sin un usuario autenticado.');
  }

  const cleanTitle = payload.title.trim();
  if (!cleanTitle) {
    throw new Error('El título de la tarea es obligatorio.');
  }

  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    userId, // Obtenido exclusivamente del estado de autenticación
    title: cleanTitle,
    description: payload.description?.trim() || '',
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Actualiza una tarea existente.
 * SEGURIDAD: Nunca actualiza ni permite cambiar el userId del documento.
 */
export async function updateTask(
  taskId: string,
  payload: UpdateTaskPayload
): Promise<void> {
  if (!taskId) {
    throw new Error('Identificador de tarea no válido.');
  }

  const cleanTitle = payload.title.trim();
  if (!cleanTitle) {
    throw new Error('El título de la tarea no puede estar vacío.');
  }

  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskDocRef, {
    title: cleanTitle,
    description: payload.description?.trim() || '',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Alterna el estado completado/pendiente de una tarea.
 */
export async function toggleTaskComplete(
  taskId: string,
  currentCompleted: boolean
): Promise<void> {
  if (!taskId) {
    throw new Error('Identificador de tarea no válido.');
  }

  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskDocRef, {
    completed: !currentCompleted,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina una tarea por su ID en Firestore.
 */
export async function deleteTask(taskId: string): Promise<void> {
  if (!taskId) {
    throw new Error('Identificador de tarea no válido.');
  }

  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(taskDocRef);
}

/**
 * Suscripción en tiempo real (onSnapshot) a las tareas del usuario autenticado.
 * Filtra estrictamente por userId y limpia la suscripción al desmontarse.
 */
export function subscribeToUserTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          title: data.title || '',
          description: data.description || '',
          completed: Boolean(data.completed),
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        };
      });

      // Ordenar en cliente por fecha de creación descendente (más recientes primero)
      tasks.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));

      onUpdate(tasks);
    },
    (error) => {
      console.error('Error al escuchar tareas en tiempo real:', error);
      onError(new Error('Error al sincronizar las tareas desde Firestore.'));
    }
  );
}

