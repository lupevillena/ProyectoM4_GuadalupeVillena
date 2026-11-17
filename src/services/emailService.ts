export interface SendSummaryResponse {
  success: boolean;
  message: string;
  recipient: string;
  stats?: {
    total: number;
    pending: number;
    completed: number;
  };
}

/**
 * Invoca la función serverless de Vercel enviando el ID Token del usuario autenticado.
 * SEGURIDAD: Nunca envía credenciales de AWS ni claves privadas de Firebase desde el frontend.
 */
export async function sendTaskSummaryEmail(idToken: string): Promise<SendSummaryResponse> {
  if (!idToken) {
    throw new Error('No se encontró una sesión activa válida para enviar el resumen.');
  }

  const response = await fetch('/api/send-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `Error del servidor (${response.status}): No se pudo enviar el correo.`;
    throw new Error(errorMsg);
  }

  return data as SendSummaryResponse;
}

