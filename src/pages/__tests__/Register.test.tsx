import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from '../Register';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Register Page', () => {
  const mockRegisterUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      currentUser: null,
      loading: false,
      loginUser: vi.fn(),
      registerUser: mockRegisterUser,
      logoutUser: vi.fn(),
    });
  });

  it('renderiza el formulario de registro correctamente', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Cuenta/i })).toBeInTheDocument();
  });

  it('muestra un error si las contraseñas tienen menos de 6 caracteres', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La contraseña debe tener al menos 6 caracteres.'
    );
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it('muestra un error si las contraseñas no coinciden', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
      target: { value: 'different123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Las contraseñas no coinciden. Por favor, verifica nuevamente.'
    );
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it('llama a registerUser con valores válidos', async () => {
    mockRegisterUser.mockResolvedValueOnce({} as any);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });
});

