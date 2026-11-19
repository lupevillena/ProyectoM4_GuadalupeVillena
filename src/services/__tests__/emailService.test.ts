import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTaskSummaryEmail } from '../emailService';

describe('emailService - sendTaskSummaryEmail', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('lanza un error si el idToken está vacío', async () => {
    await expect(sendTaskSummaryEmail('')).rejects.toThrow(
      'No se encontró una sesión activa válida para enviar el resumen.'
    );
  });

  it('llama al endpoint /api/send-summary con el Bearer token correcto y retorna éxito', async () => {
    const mockResponse = {
      success: true,
      message: 'Resumen enviado exitosamente a la dirección de prueba verificada en SES.',
      recipient: 'test@example.com',
      stats: { total: 3, pending: 1, completed: 2 },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await sendTaskSummaryEmail('fake-jwt-token-123');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/send-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer fake-jwt-token-123',
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it('lanza un error cuando el servidor responde con status de error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Token inválido o expirado.' }),
    });

    await expect(sendTaskSummaryEmail('expired-token')).rejects.toThrow(
      'Token inválido o expirado.'
    );
  });

  it('maneja respuestas de error del servidor sin payload JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Not JSON');
      },
    });

    await expect(sendTaskSummaryEmail('token')).rejects.toThrow(
      'Error del servidor (500): No se pudo enviar el correo.'
    );
  });
});
