import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { ConfirmModal } from '../components/ConfirmModal';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

export const Dashboard: React.FC = () => {
  const { currentUser, logoutUser } = useAuth();
  const {
    tasks,
    loading,
    error: tasksError,
    addTask,
    editTask,
    toggleComplete,
    removeTask,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Cerrar sesión
  const handleLogout = async () => {
    setActionError(null);
    try {
      setIsLoggingOut(true);
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (err) {
      setActionError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Crear o actualizar tarea
  const handleSubmitTask = async (payload: CreateTaskPayload | UpdateTaskPayload) => {
    setActionError(null);
    try {
      setIsFormSubmitting(true);
      if (editingTask) {
        // SEGURIDAD: Solo enviamos title y description, preservando userId
        await editTask(editingTask.id, payload);
        setEditingTask(null);
      } else {
        await addTask(payload as CreateTaskPayload);
      }
    } catch (err) {
      setActionError(getFirebaseErrorMessage(err));
      throw err;
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Alternar completado
  const handleToggleComplete = async (task: Task) => {
    setActionError(null);
    try {
      setBusyTaskId(task.id);
      await toggleComplete(task.id, task.completed);
    } catch (err) {
      setActionError(getFirebaseErrorMessage(err));
    } finally {
      setBusyTaskId(null);
    }
  };

  // Confirmar y eliminar tarea
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setActionError(null);
    try {
      setIsDeleting(true);
      await removeTask(taskToDelete.id);
      if (editingTask?.id === taskToDelete.id) {
        setEditingTask(null);
      }
      setTaskToDelete(null);
    } catch (err) {
      setActionError(getFirebaseErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Contadores de tareas para métricas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="dashboard-layout">
      {/* Barra de navegación superior */}
      <header className="dashboard-navbar">
        <div className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">📋</span>
          <div>
            <h1 className="navbar-title">TaskManager SPA</h1>
            <span className="navbar-badge">Cloud Firestore</span>
          </div>
        </div>

        <div className="navbar-user-actions">
          <div className="user-badge" title={currentUser?.email || 'Usuario'}>
            <span className="user-avatar" aria-hidden="true">👤</span>
            <span className="user-email">{currentUser?.email}</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </header>

      {/* Contenido principal del dashboard */}
      <main className="dashboard-main">
        {actionError && (
          <div className="alert alert-error mb-4" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{actionError}</span>
          </div>
        )}

        {/* Banner con saludo y métricas de tareas */}
        <div className="welcome-banner">
          <div className="welcome-header">
            <div>
              <h2 className="welcome-title">
                Mis Tareas Personales
              </h2>
              <p className="welcome-subtitle">
                Gestión en tiempo real sincronizada con Google Cloud Firestore.
              </p>
            </div>

            <div className="stats-container">
              <div className="stat-box">
                <span className="stat-number">{totalTasks}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{pendingTasks}</span>
                <span className="stat-label">Pendientes</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{completedTasks}</span>
                <span className="stat-label">Completadas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de gestión de tareas */}
        <div className="tasks-dashboard-layout">
          {/* Formulario de creación / edición */}
          <section aria-label="Formulario de tareas" className="tasks-sidebar">
            <TaskForm
              key={editingTask ? editingTask.id : 'new-task'}
              editingTask={editingTask}
              onSubmit={handleSubmitTask}
              onCancelEdit={() => setEditingTask(null)}
              isSubmitting={isFormSubmitting}
            />
          </section>

          {/* Lista de tareas en tiempo real */}
          <section aria-label="Listado de tareas" className="tasks-content">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={tasksError}
              onToggleComplete={handleToggleComplete}
              onEdit={(task) => {
                setEditingTask(task);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRequestDelete={(task) => setTaskToDelete(task)}
              busyTaskId={busyTaskId}
            />
          </section>
        </div>
      </main>

      {/* Modal accesible de confirmación para eliminar */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="¿Eliminar esta tarea?"
        message={`¿Estás segura de que deseas eliminar permanentemente la tarea "${taskToDelete?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
