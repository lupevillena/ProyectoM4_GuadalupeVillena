import React from 'react';
import type { Task } from '../types/task';
import type { Timestamp } from 'firebase/firestore';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  isUpdating?: boolean;
}

function formatDate(val: Timestamp | Date | null | undefined): string {
  if (!val) return 'Sin fecha';
  let date: Date;
  if (typeof (val as Timestamp).toDate === 'function') {
    date = (val as Timestamp).toDate();
  } else if (val instanceof Date) {
    date = val;
  } else {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  isUpdating = false,
}) => {
  return (
    <li className={`task-item ${task.completed ? 'task-completed' : ''}`}>
      <div className="task-content">
        <div className="task-header-row">
          <button
            type="button"
            className={`task-checkbox ${task.completed ? 'checked' : ''}`}
            onClick={() => onToggleComplete(task)}
            disabled={isUpdating}
            aria-label={
              task.completed
                ? `Marcar "${task.title}" como pendiente`
                : `Marcar "${task.title}" como completada`
            }
          >
            {task.completed ? '✓' : ''}
          </button>

          <h3 className="task-title-text">{task.title}</h3>

          <span
            className={`badge ${
              task.completed ? 'badge-success' : 'badge-warning'
            }`}
          >
            {task.completed ? 'Completada' : 'Pendiente'}
          </span>
        </div>

        {task.description && (
          <p className="task-description-text">{task.description}</p>
        )}

        <div className="task-meta">
          <span className="task-date">
            📅 Creada: {formatDate(task.createdAt)}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onToggleComplete(task)}
          disabled={isUpdating}
          title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {task.completed ? '↩ Pendiente' : '✓ Completar'}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(task)}
          disabled={isUpdating}
          title="Editar título o descripción"
        >
          ✏️ Editar
        </button>

        <button
          type="button"
          className="btn btn-danger-outline btn-sm"
          onClick={() => onRequestDelete(task)}
          disabled={isUpdating}
          title="Eliminar tarea definitivamente"
        >
          🗑️ Eliminar
        </button>
      </div>
    </li>
  );
};

