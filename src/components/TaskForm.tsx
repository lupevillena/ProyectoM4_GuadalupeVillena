import React, { useState } from 'react';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

interface TaskFormProps {
  editingTask: Task | null;
  onSubmit: (data: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
  onCancelEdit?: () => void;
  isSubmitting?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  editingTask,
  onSubmit,
  onCancelEdit,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('El título de la tarea es obligatorio.');
      return;
    }

    try {
      await onSubmit({
        title: cleanTitle,
        description: description.trim(),
      });

      if (!editingTask) {
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Ocurrió un error al guardar la tarea.');
      }
    }
  };

  return (
    <div className="card task-form-card">
      <div className="task-form-header">
        <h2 className="card-title">
          {editingTask ? '✏️ Modificar Tarea' : '➕ Crear Nueva Tarea'}
        </h2>
        {editingTask && onCancelEdit && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancelar Edición
          </button>
        )}
      </div>

      {formError && (
        <div className="alert alert-error mb-4" role="alert">
          <span className="alert-icon" aria-hidden="true">⚠️</span>
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="task-form" noValidate>
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Título <span className="text-danger">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="Ej. Estudiar reglas de seguridad de Firestore"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={120}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-description" className="form-label">
            Descripción <span className="text-muted">(Opcional)</span>
          </label>
          <textarea
            id="task-description"
            className="form-input form-textarea"
            placeholder="Detalles adicionales, enlaces o notas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="task-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editingTask
                ? 'Guardando cambios...'
                : 'Creando tarea...'
              : editingTask
              ? 'Guardar Cambios'
              : 'Agregar Tarea'}
          </button>
        </div>
      </form>
    </div>
  );
};
