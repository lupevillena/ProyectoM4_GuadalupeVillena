import { FirebaseError } from 'firebase/app';

/**
 * Traduce los códigos de error de Firebase Authentication a mensajes comprensibles en español.
 */
export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya se encuentra registrado. Intenta iniciar sesión.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/operation-not-allowed':
        return 'El proveedor de inicio de sesión por correo y contraseña no está habilitado en Firebase.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      case 'auth/user-disabled':
        return 'Esta cuenta de usuario ha sido suspendida o deshabilitada.';
      case 'auth/user-not-found':
        return 'No existe ningún usuario registrado con este correo electrónico.';
      case 'auth/wrong-password':
        return 'La contraseña ingresada es incorrecta.';
      case 'auth/invalid-credential':
        return 'Credenciales inválidas. Verifica tu correo y contraseña.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos consecutivos. Por seguridad, inténtalo más tarde.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
      case 'auth/missing-password':
        return 'Por favor, ingresa una contraseña.';
      case 'auth/popup-closed-by-user':
        return 'La ventana de autenticación fue cerrada antes de completar el proceso.';
      default:
        return `Error de autenticación (${error.code}). Por favor, inténtalo nuevamente.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado al procesar la solicitud.';
}

