import { describe, it, expect } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { getFirebaseErrorMessage } from '../firebaseErrors';

describe('getFirebaseErrorMessage', () => {
  it('traduce auth/email-already-in-use correctamente', () => {
    const error = new FirebaseError('auth/email-already-in-use', 'Email in use');
    expect(getFirebaseErrorMessage(error)).toBe(
      'El correo electrónico ya se encuentra registrado. Intenta iniciar sesión.'
    );
  });

  it('traduce auth/invalid-credential correctamente', () => {
    const error = new FirebaseError('auth/invalid-credential', 'Invalid credentials');
    expect(getFirebaseErrorMessage(error)).toBe(
      'Credenciales inválidas. Verifica tu correo y contraseña.'
    );
  });

  it('traduce auth/weak-password correctamente', () => {
    const error = new FirebaseError('auth/weak-password', 'Weak password');
    expect(getFirebaseErrorMessage(error)).toBe(
      'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.'
    );
  });

  it('traduce auth/wrong-password correctamente', () => {
    const error = new FirebaseError('auth/wrong-password', 'Wrong password');
    expect(getFirebaseErrorMessage(error)).toBe('La contraseña ingresada es incorrecta.');
  });

  it('traduce auth/user-not-found correctamente', () => {
    const error = new FirebaseError('auth/user-not-found', 'User not found');
    expect(getFirebaseErrorMessage(error)).toBe(
      'No existe ningún usuario registrado con este correo electrónico.'
    );
  });

  it('retorna mensaje por defecto para códigos no mapeados', () => {
    const error = new FirebaseError('auth/unknown-error-code', 'Unknown');
    expect(getFirebaseErrorMessage(error)).toContain('Error de autenticación');
  });

  it('retorna el mensaje de una instancia estándar de Error', () => {
    const error = new Error('Mensaje personalizado');
    expect(getFirebaseErrorMessage(error)).toBe('Mensaje personalizado');
  });

  it('retorna mensaje genérico para tipos no Error', () => {
    expect(getFirebaseErrorMessage('algo salio mal')).toBe(
      'Ocurrió un error inesperado al procesar la solicitud.'
    );
  });
});

