import React, { useState, useMemo } from 'react';
import type { Task, TaskFilter } from '../types/task';
import { TaskItem } from './TaskItem';
import { LoadingSpinner } from './LoadingSpinner';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  busyTaskId?: string | null;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  busyTaskId,
}) => {
  const [filter, setFilter] = useState<TaskFilter>('all');

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'pending':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  if (loading) {
    return (
      <div className="card task-list-card">
        <LoadingSpinner message="Cargando tus tareas desde Firestore..." />
      </div>
    );
  }

  return (
    <div className="card task-list-card">
      <div className="task-list-header">
        <div className="task-list-title-wrap">
          <h2 className="card-title">Mis Tareas</h2>
          <span className="badge badge-info">{counts.total} en total</span>
        </div>

        {/* Filtros */}
        <div className="task-filters" role="tablist" aria-label="Filtrar tareas">
          <button
            type="button"
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            Todas ({counts.total})
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
            role="tab"
            aria-selected={filter === 'pending'}
          >
            Pendientes ({counts.pending})
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
            role="tab"
            aria-selected={filter === 'completed'}
          >
            Completadas ({counts.completed})
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4" role="alert">
          <span className="alert-icon" aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">📝</span>
          <h3 className="empty-title">Aún no tienes tareas</h3>
          <p className="empty-description">
            Usa el formulario de arriba para crear tu primera tarea y organizarte mejor.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">🔍</span>
          <h3 className="empty-title">Sin resultados</h3>
          <p className="empty-description">
            No tienes tareas en estado <strong>{filter === 'completed' ? 'completadas' : 'pendientes'}</strong>.
          </p>
        </div>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
              isUpdating={busyTaskId === task.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

