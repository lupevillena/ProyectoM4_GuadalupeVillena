# TaskManager SPA — Proyecto Integrador 4

[![Deploy with Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://proyecto-m4-guadalupe-villena.vercel.app)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange?logo=firebase)](https://firebase.google.com/)
[![AWS SES](https://img.shields.io/badge/AWS-SES%20Email-232F3E?logo=amazon-aws)](https://aws.amazon.com/ses/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20%26%20RTL-brightgreen?logo=vitest)](https://vitest.dev/)

Aplicación web SPA (*Single Page Application*) moderna, escalable y segura para la gestión de tareas personales en tiempo real, desarrollada con **React**, **TypeScript** y **Vite**, respaldada por **Google Firebase** (Authentication & Cloud Firestore), notificaciones automatizadas por correo electrónico con **Amazon Simple Email Service (SES)** mediante una función Serverless en **Vercel**, y suite de pruebas unitarias y de integración con **Vitest** y **React Testing Library**.

---

## 🌐 Aplicación en Producción

* **URL del Despliegue Oficial en Vercel:**  
  👉 **[https://proyecto-m4-guadalupe-villena.vercel.app](https://proyecto-m4-guadalupe-villena.vercel.app)**

* **Repositorio en GitHub:**  
  👉 **[https://github.com/lupevillena/ProyectoM4_GuadalupeVillena](https://github.com/lupevillena/ProyectoM4_GuadalupeVillena)**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Librería de interfaz reactiva con tipado estático estricto. |
| **Build Tool & Bundler** | Vite 8 | Servidor de desarrollo HMR ultrarrápido y empaquetador de producción. |
| **Enrutamiento** | React Router DOM v7 | SPA con control de historial y guardias de navegación (`ProtectedRoute` y `PublicRoute`). |
| **Autenticación** | Firebase Authentication | Registro e inicio de sesión seguro con correo/contraseña y persistencia de sesión. |
| **Base de Datos** | Google Cloud Firestore | Base de datos NoSQL documental con sincronización en tiempo real (`onSnapshot`). |
| **Backend / API** | Vercel Serverless Functions (`/api`) | Endpoint serverless Node.js aislado para operaciones privilegiadas. |
| **SDK Servidor** | Firebase Admin SDK | Validación criptográfica de Firebase ID Tokens y consultas autorizadas. |
| **Envío de Correos** | Amazon SES (`@aws-sdk/client-ses`) | Servicio de correo en la nube de alta disponibilidad (Región `us-east-1`). |
| **Testing** | Vitest + React Testing Library + JSDOM | Pruebas unitarias y de componentes con mocks controlados. |
| **Linter & Calidad** | Oxlint | Análisis estático de código de alto rendimiento. |
| **Hosting & CI/CD** | Vercel | Despliegue continuo automatizado conectado a la rama `main` de GitHub. |

---

## 📋 Funcionalidades Principales

### 1. Autenticación y Control de Acceso
* Registro de usuarios con validación de contraseña (mínimo 6 caracteres, confirmación coincidente).
* Inicio de sesión con persistencia automática de sesión (recarga sin desconexión).
* Cierre de sesión seguro con redirección a la vista de login.
* Traducción exhaustiva y amigable de códigos de error de Firebase Authentication al español.
* Rutas protegidas: bloqueo de acceso a usuarios no autenticados y redirección automática al Dashboard si ya hay sesión activa.

### 2. Gestión de Tareas en Tiempo Real (Cloud Firestore)
* **Creación:** Formulario accesible con título obligatorio y descripción opcional.
* **Lectura en tiempo real:** Suscripción reactiva mediante `onSnapshot` con limpieza de memoria (*cleanup*) al desmontar.
* **Edición:** Modificación instantánea de título y descripción con sincronización en la nube.
* **Alternar estado:** Marcado de tareas como *Completadas* (con estilo tachado) o *Pendientes*.
* **Eliminación con confirmación:** Cuadro de diálogo modal accesible (`role="dialog"`, soporte de tecla `Escape`) para prevenir borrados accidentales.
* **Filtros por estado:** Pestañas para filtrar tareas (*Todas*, *Pendientes*, *Completadas*) con métricas numéricas.

### 3. Envío de Resumen de Tareas por Correo (Amazon SES)
* Botón en el dashboard para solicitar un resumen de tareas por correo.
* La solicitud se procesa a través de la función serverless segura `/api/send-summary`.
* Construcción del correo en el servidor con formato **HTML responsive** y versión en **texto plano**.
* Muestra de métricas (Total, Pendientes, Completadas) y listado ordenado de las tareas del usuario.
* Feedback visual inmediato: estados de carga (*spinner*), mensajes de éxito con el destinatario verificado y manejo de errores.

---

## 🔒 Arquitectura de Seguridad

1. **Aislamiento de Secretos (Zero Secrets in Frontend):**  
   Las credenciales de AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) y la clave privada de Firebase Admin (`FIREBASE_PRIVATE_KEY`) **nunca se incluyen en variables `VITE_*` ni viajan al navegador**. Residen exclusivamente en el entorno de ejecución serverless de Vercel.
2. **Validación Criptográfica de Tokens:**  
   El endpoint `/api/send-summary` exige un `Bearer <idToken>`. El servidor utiliza `verifyIdToken()` de Firebase Admin para verificar la firma digital del token y extraer el `uid`. Jamás se confía en un `userId` enviado en el cuerpo de la petición.
3. **Restricción de Destinatario en Sandbox de Amazon SES:**  
   Dado que la cuenta de SES opera en modo sandbox, el endpoint no acepta un correo arbitrario desde el cliente para evitar abusos o rebotes; despacha exclusivamente a la dirección de prueba verificada en el servidor (`SES_TO_EMAIL`).
4. **Protección en Git:**  
   Archivo `.gitignore` configurado rigurosamente para ignorar archivos `.env`, `.env.local`, archivos `.csv` de credenciales IAM, claves privadas `.json`, `.key` y `.pem`.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* **Node.js** >= v20.0.0
* **npm** >= 10.0.0

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/lupevillena/ProyectoM4_GuadalupeVillena.git
   cd ProyectoM4_GuadalupeVillena
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno locales:**  
   Crea un archivo `.env.local` en la raíz del proyecto basándote en `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Completa los valores públicos de tu proyecto Firebase (ver siguiente sección).

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

5. **Compilar para producción localmente:**
   ```bash
   npm run build
   ```

---

## ⚙️ Variables de Entorno

El archivo `.env.example` detalla las variables requeridas por la aplicación:

### Frontend (Archivo `.env.local` y Vercel Environment Variables)
| Variable | Descripción |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Clave API pública de la aplicación web en Firebase. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación de Firebase (`proyecto.firebaseapp.com`). |
| `VITE_FIREBASE_PROJECT_ID` | Identificador único del proyecto en Firebase. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento de Firebase. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de mensajería de Firebase. |
| `VITE_FIREBASE_APP_ID` | Identificador único de la app web en Firebase. |

### Backend / Serverless (Solo en Vercel Dashboard)
| Variable | Descripción |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Access Key de IAM con permisos para `ses:SendEmail`. |
| `AWS_SECRET_ACCESS_KEY` | Secret Key asociada al usuario IAM de AWS. |
| `AWS_REGION` | Región de AWS SES (`us-east-1`). |
| `SES_FROM_EMAIL` | Dirección de correo con identidad verificada en Amazon SES (remitente). |
| `SES_TO_EMAIL` | Dirección de correo verificada para recepción en entorno sandbox (destinatario). |
| `FIREBASE_PROJECT_ID` | ID del proyecto de Firebase. |
| `FIREBASE_CLIENT_EMAIL` | Correo electrónico de la Service Account de Firebase Admin. |
| `FIREBASE_PRIVATE_KEY` | Clave privada RSA de la Service Account de Firebase Admin. |

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una suite completa de **41 pruebas automatizadas** implementadas con **Vitest** y **React Testing Library**, diseñadas bajo la premisa de aislar servicios externos mediante mocks controlados:

```bash
# Ejecutar todas las pruebas en modo CI / producción
npm test

# Ejecutar pruebas en modo observador interactivo (watch)
npm run test:watch
```

### Cobertura de las pruebas:
* **Autenticación:**
  * Renderizado, validación de formularios, llamada a `loginUser` y `registerUser`.
  * Validación de contraseñas (longitud mínima y coincidencia).
  * Mapeo de errores de Firebase al español (`getFirebaseErrorMessage`).
* **Gestión de Tareas:**
  * Componentes `TaskForm`, `TaskItem`, `TaskList` y `ConfirmModal`.
  * Servicio `taskService`: creación con `serverTimestamp`, actualización protegida sin alteración de `userId`, alternancia de completado y eliminación.
* **Servicio de Envío de Resumen (Amazon SES):**
  * Validación de token de autorización Bearer hacia `/api/send-summary`.
  * Manejo de respuestas exitosas y traducción de errores del servidor sin fugas de secretos.

---

## ☁️ Despliegue en Vercel

La aplicación está configurada con despliegue continuo (CI/CD):
1. Cada push a la rama `main` en GitHub dispara una compilación automática en Vercel.
2. Vercel compila los activos estáticos del frontend mediante Vite (`tsc -b && vite build`) y expone la función serverless de la carpeta `api/`.
3. Para la correcta ejecución del envío de correos, las variables de entorno de AWS y Firebase Admin deben encontrarse configuradas en:  
   *Vercel Dashboard > Settings > Environment Variables*.

---

## 👩‍💻 Autora

* **Guadalupe Villena** — Proyecto Integrador — Módulo 4
* Repositorio: [github.com/lupevillena/ProyectoM4_GuadalupeVillena](https://github.com/lupevillena/ProyectoM4_GuadalupeVillena)
* Aplicación web: [proyecto-m4-guadalupe-villena.vercel.app](https://proyecto-m4-guadalupe-villena.vercel.app)
