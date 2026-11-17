import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore, type QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Normaliza la clave privada de Firebase Admin para que funcione sin importar cómo
 * fue copiada en las variables de entorno de Vercel (con comillas envolventes,
 * saltos de línea reales o '\n' literales).
 */
function formatPrivateKey(key: string): string {
  let cleaned = key.trim();

  // Remueve comillas envolventes si el valor fue pegado con comillas dobles o simples
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }

  // Convierte secuencias literales de escape '\n' a saltos de línea reales (\n)
  return cleaned.replace(/\\n/g, '\n');
}

/**
 * Inicializa Firebase Admin de forma segura como Singleton en Vercel Serverless.
 */
function initFirebaseAdmin() {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (err) {
        console.error('Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY, intentando applicationDefault:', err);
        initializeApp({
          credential: applicationDefault(),
        });
      }
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    } else {
      initializeApp();
    }
  }

  return {
    adminAuth: getAuth(),
    adminDb: getFirestore(),
  };
}

interface TaskData {
  title: string;
  description?: string;
  completed: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo se admiten solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido. Utiliza POST.',
    });
  }

  try {
    const { adminAuth, adminDb } = initFirebaseAdmin();

    // 1. Verificación de seguridad del Firebase ID Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado. Se requiere un Bearer token en el encabezado Authorization.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    if (!idToken) {
      return res.status(401).json({
        error: 'Token de autenticación vacío o malformado.',
      });
    }

    // SEGURIDAD: Obtenemos el userId exclusivamente del token criptográficamente firmado
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (authError) {
      console.error('Error al verificar Firebase ID token:', authError);
      return res.status(401).json({
        error: 'Token inválido o expirado. Por favor, vuelve a iniciar sesión.',
      });
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email || 'Usuario';

    // 2. Consulta en Firestore únicamente de las tareas del usuario autenticado
    const tasksSnapshot = await adminDb
      .collection('tasks')
      .where('userId', '==', userId)
      .get();

    const tasks: TaskData[] = tasksSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        title: data.title || 'Sin título',
        description: data.description || '',
        completed: Boolean(data.completed),
      };
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // 3. SEGURIDAD SES Sandbox: Solo se envía al destinatario verificado en el servidor
    // Nunca aceptamos un destinatario arbitrario proveniente del cliente
    const fromEmail = process.env.SES_FROM_EMAIL;
    const toEmail = process.env.SES_TO_EMAIL || fromEmail;

    if (!fromEmail || !toEmail) {
      return res.status(500).json({
        error:
          'Configuración incompleta en el servidor: SES_FROM_EMAIL y SES_TO_EMAIL deben estar definidas.',
      });
    }

    // 4. Construcción del resumen (HTML y Texto plano)
    const taskListHtml =
      tasks.length === 0
        ? '<p style="color: #64748b; font-style: italic;">No tienes tareas registradas actualmente.</p>'
        : `<ul style="list-style: none; padding: 0;">
            ${tasks
              .map(
                (t) => `
              <li style="padding: 10px; border-bottom: 1px solid #e2e8f0; margin-bottom: 6px;">
                <span style="font-weight: bold; ${
                  t.completed ? 'text-decoration: line-through; color: #94a3b8;' : 'color: #0f172a;'
                }">
                  [${t.completed ? 'COMPLETADA' : 'PENDIENTE'}] ${t.title}
                </span>
                ${
                  t.description
                    ? `<div style="font-size: 13px; color: #475569; margin-top: 4px;">${t.description}</div>`
                    : ''
                }
              </li>`
              )
              .join('')}
          </ul>`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
          Resumen de Tareas - TaskManager SPA
        </h2>
        <p>Hola <strong>${userEmail}</strong>, a continuación tienes el estado de tus tareas:</p>
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
          <p style="margin: 4px 0;"><strong>Total de tareas:</strong> ${totalTasks}</p>
          <p style="margin: 4px 0; color: #d97706;"><strong>Pendientes:</strong> ${pendingTasks}</p>
          <p style="margin: 4px 0; color: #16a34a;"><strong>Completadas:</strong> ${completedTasks}</p>
        </div>
        <h3 style="color: #334155;">Listado de Tareas:</h3>
        ${taskListHtml}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
        <p style="font-size: 11px; color: #94a3b8;">
          Este correo fue generado de forma automática mediante Amazon SES y Vercel Serverless Functions.
        </p>
      </div>
    `;

    const textBody = `
Resumen de Tareas - TaskManager SPA
Usuario: ${userEmail}

Métricas:
- Total: ${totalTasks}
- Pendientes: ${pendingTasks}
- Completadas: ${completedTasks}

Listado:
${
  tasks.length === 0
    ? 'No tienes tareas registradas actualmente.'
    : tasks
        .map(
          (t, i) =>
            `${i + 1}. [${t.completed ? 'COMPLETADA' : 'PENDIENTE'}] ${t.title}${
              t.description ? ` - ${t.description}` : ''
            }`
        )
        .join('\n')
}
    `.trim();

    // 5. Envío del correo usando Amazon SES SDK
    const sesRegion = process.env.AWS_REGION || 'us-east-1';
    const sesClient = new SESClient({
      region: sesRegion,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const sendEmailCommand = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: `Resumen de Tareas (${pendingTasks} pendientes) - TaskManager`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(sendEmailCommand);

    return res.status(200).json({
      success: true,
      message: 'Resumen enviado exitosamente a la dirección de prueba verificada en SES.',
      recipient: toEmail,
      messageId: response.MessageId,
      stats: {
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
      },
    });
  } catch (error) {
    console.error('Error al procesar el envío de resumen con SES:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error interno al procesar el resumen.';
    return res.status(500).json({
      error: `Error al enviar el correo: ${errorMessage}`,
    });
  }
}
