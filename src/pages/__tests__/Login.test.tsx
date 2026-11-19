import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../Login';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Login Page', () => {
  const mockLoginUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      currentUser: null,
      loading: false,
      loginUser: mockLoginUser,
      registerUser: vi.fn(),
      logoutUser: vi.fn(),
    });
  });

  it('renderiza el formulario de inicio de sesión correctamente', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
  });

  it('muestra un error si se intenta enviar el formulario con campos vacíos', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Por favor, completa todos los campos.'
    );
    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  it('llama a loginUser cuando los datos son válidos', async () => {
    mockLoginUser.mockResolvedValueOnce({} as any);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('muestra el mensaje de error cuando loginUser falla', async () => {
    mockLoginUser.mockRejectedValueOnce(new Error('Credenciales inválidas.'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciales inválidas.'
    );
  });
});
