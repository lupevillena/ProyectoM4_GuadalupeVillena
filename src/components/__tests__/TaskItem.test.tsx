import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '../TaskItem';
import type { Task } from '../../types/task';

describe('TaskItem Component', () => {
  const sampleTask: Task = {
    id: 'task-100',
    userId: 'user-1',
    title: 'Estudiar para el examen',
    description: 'Repasar React Testing Library y Vitest',
    completed: false,
    createdAt: null,
    updatedAt: null,
  };

  it('renderiza el título, la descripción y el badge de pendiente', () => {
    render(
      <TaskItem
        task={sampleTask}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Estudiar para el examen')).toBeInTheDocument();
    expect(
      screen.getByText('Repasar React Testing Library y Vitest')
    ).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('llama a onToggleComplete cuando se hace clic en el botón de completar', () => {
    const handleToggle = vi.fn();
    render(
      <TaskItem
        task={sampleTask}
        onToggleComplete={handleToggle}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
      />
    );

    const completeBtn = screen.getByRole('button', { name: /✓ Completar/i });
    fireEvent.click(completeBtn);

    expect(handleToggle).toHaveBeenCalledWith(sampleTask);
  });

  it('llama a onEdit cuando se hace clic en el botón de editar', () => {
    const handleEdit = vi.fn();
    render(
      <TaskItem
        task={sampleTask}
        onToggleComplete={vi.fn()}
        onEdit={handleEdit}
        onRequestDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole('button', { name: /✏️ Editar/i });
    fireEvent.click(editBtn);

    expect(handleEdit).toHaveBeenCalledWith(sampleTask);
  });

  it('llama a onRequestDelete cuando se hace clic en el botón de eliminar', () => {
    const handleDelete = vi.fn();
    render(
      <TaskItem
        task={sampleTask}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onRequestDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /🗑️ Eliminar/i });
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith(sampleTask);
  });

  it('muestra estado completado y botón para marcar como pendiente', () => {
    const completedTask: Task = {
      ...sampleTask,
      completed: true,
    };

    render(
      <TaskItem
        task={completedTask}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Completada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /↩ Pendiente/i })).toBeInTheDocument();
  });
});

