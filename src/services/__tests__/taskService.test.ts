import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
} from '../taskService';
import * as firestore from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, _col, id) => ({ id })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP_MOCK'),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('../firebase', () => ({
  db: {},
}));

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('lanza error si no se proporciona un userId', async () => {
      await expect(
        createTask('', { title: 'Nueva tarea' })
      ).rejects.toThrow('No se puede crear una tarea sin un usuario autenticado.');
    });

    it('lanza error si el título está vacío', async () => {
      await expect(
        createTask('user-123', { title: '   ' })
      ).rejects.toThrow('El título de la tarea es obligatorio.');
    });

    it('crea el documento en Firestore asociando el userId autenticado y completed en false', async () => {
      vi.mocked(firestore.addDoc).mockResolvedValueOnce({ id: 'task-doc-1' } as any);

      const id = await createTask('user-123', {
        title: ' Tarea de prueba ',
        description: ' Descripción opcional ',
      });

      expect(id).toBe('task-doc-1');
      expect(firestore.addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          userId: 'user-123',
          title: 'Tarea de prueba',
          description: 'Descripción opcional',
          completed: false,
          createdAt: 'SERVER_TIMESTAMP_MOCK',
          updatedAt: 'SERVER_TIMESTAMP_MOCK',
        })
      );
    });
  });

  describe('updateTask', () => {
    it('lanza error si el título está vacío', async () => {
      await expect(
        updateTask('task-1', { title: '   ' })
      ).rejects.toThrow('El título de la tarea no puede estar vacío.');
    });

    it('actualiza el título y la descripción sin modificar el userId', async () => {
      vi.mocked(firestore.updateDoc).mockResolvedValueOnce();

      await updateTask('task-1', {
        title: 'Título editado',
        description: 'Descripción editada',
      });

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'task-1' }),
        {
          title: 'Título editado',
          description: 'Descripción editada',
          updatedAt: 'SERVER_TIMESTAMP_MOCK',
        }
      );
    });
  });

  describe('toggleTaskComplete', () => {
    it('alterna el estado de completado en Firestore', async () => {
      vi.mocked(firestore.updateDoc).mockResolvedValueOnce();

      await toggleTaskComplete('task-1', false);

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'task-1' }),
        {
          completed: true,
          updatedAt: 'SERVER_TIMESTAMP_MOCK',
        }
      );
    });
  });

  describe('deleteTask', () => {
    it('elimina el documento correspondiente en Firestore', async () => {
      vi.mocked(firestore.deleteDoc).mockResolvedValueOnce();

      await deleteTask('task-to-delete');

      expect(firestore.deleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'task-to-delete' })
      );
    });
  });
});

