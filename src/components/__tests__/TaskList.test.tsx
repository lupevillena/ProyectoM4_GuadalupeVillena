import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskList } from '../TaskList';
import type { Task } from '../../types/task';

describe('TaskList Component', () => {
  const tasksMock: Task[] = [
    {
      id: '1',
      userId: 'u1',
      title: 'Tarea 1',
      description: 'Desc 1',
      completed: false,
      createdAt: null,
      updatedAt: null,
    },
    {
      id: '2',
      userId: 'u1',
      title: 'Tarea 2',
      description: '',
      completed: true,
      createdAt: null,
      updatedAt: null,
    },
  ];

  it('muestra el indicador de carga cuando loading es true', () => {
    render(
      <TaskList
        tasks={[]}
        loading={true}
        error={null}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/Cargando tus tareas desde Firestore/i)).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay ninguna tarea', () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        error={null}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Aún no tienes tareas')).toBeInTheDocument();
  });

  it('renderiza la lista de tareas y permite filtrar por completadas y pendientes', () => {
    render(
      <TaskList
        tasks={tasksMock}
        loading={false}
        error={null}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Tarea 1')).toBeInTheDocument();
    expect(screen.getByText('Tarea 2')).toBeInTheDocument();

    // Filtra por Pendientes
    const pendientesTab = screen.getByRole('tab', { name: /Pendientes/i });
    fireEvent.click(pendientesTab);
    expect(screen.getByText('Tarea 1')).toBeInTheDocument();
    expect(screen.queryByText('Tarea 2')).not.toBeInTheDocument();

    // Filtra por Completadas
    const completadasTab = screen.getByRole('tab', { name: /Completadas/i });
    fireEvent.click(completadasTab);
    expect(screen.queryByText('Tarea 1')).not.toBeInTheDocument();
    expect(screen.getByText('Tarea 2')).toBeInTheDocument();
  });
});

