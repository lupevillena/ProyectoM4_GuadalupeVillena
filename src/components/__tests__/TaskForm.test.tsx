import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../TaskForm';
import type { Task } from '../../types/task';

describe('TaskForm Component', () => {
  it('renderiza correctamente el formulario en modo creación', () => {
    render(<TaskForm editingTask={null} onSubmit={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Crear Nueva Tarea/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agregar Tarea/i })).toBeInTheDocument();
  });

  it('muestra un error cuando se intenta enviar el formulario con el título vacío', async () => {
    const mockSubmit = vi.fn();
    render(<TaskForm editingTask={null} onSubmit={mockSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Agregar Tarea/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El título de la tarea es obligatorio.'
    );
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('envía los datos válidos y limpia los campos', async () => {
    const mockSubmit = vi.fn().mockResolvedValueOnce(undefined);
    render(<TaskForm editingTask={null} onSubmit={mockSubmit} />);

    const titleInput = screen.getByLabelText(/Título/i);
    const descInput = screen.getByLabelText(/Descripción/i);
    const submitBtn = screen.getByRole('button', { name: /Agregar Tarea/i });

    fireEvent.change(titleInput, { target: { value: 'Completar proyecto' } });
    fireEvent.change(descInput, { target: { value: 'Detalle de la tarea' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Completar proyecto',
        description: 'Detalle de la tarea',
      });
    });

    expect(titleInput).toHaveValue('');
    expect(descInput).toHaveValue('');
  });

  it('muestra los datos prellenados y botón de cancelar en modo edición', () => {
    const mockTask: Task = {
      id: 'task-1',
      userId: 'user-1',
      title: 'Tarea existente',
      description: 'Nota existente',
      completed: false,
      createdAt: null,
      updatedAt: null,
    };
    const mockCancel = vi.fn();

    render(
      <TaskForm
        editingTask={mockTask}
        onSubmit={vi.fn()}
        onCancelEdit={mockCancel}
      />
    );

    expect(screen.getByRole('heading', { name: /Modificar Tarea/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/i)).toHaveValue('Tarea existente');
    expect(screen.getByLabelText(/Descripción/i)).toHaveValue('Nota existente');
    expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancelar Edición/i });
    fireEvent.click(cancelBtn);
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});

