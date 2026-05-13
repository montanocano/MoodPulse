# MoodPulse

Aplicación móvil de diario emocional con IA, desarrollada con React Native (Expo), Tamagui, Zustand y Firebase.

---

## Requisitos previos

| Herramienta    | Versión mínima      | Descarga                             |
| -------------- | ------------------- | ------------------------------------ |
| Node.js        | 18+                 | https://nodejs.org                   |
| JDK            | 17+                 | Incluido en Android Studio           |
| Android Studio | Cualquiera reciente | https://developer.android.com/studio |
| Git            | Cualquiera          | https://git-scm.com                  |

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd MoodPulse
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GEMINI_API_KEY=
```

| Variable                     | Dónde obtenerla                                                  |
| ---------------------------- | ---------------------------------------------------------------- |
| `EXPO_PUBLIC_FIREBASE_*`     | Firebase Console → Configuración del proyecto → Tus aplicaciones |
| `EXPO_PUBLIC_GEMINI_API_KEY` | https://aistudio.google.com/app/apikey                           |

---

## 4. Configurar Firebase

### 4.1 Autenticación

Firebase Console → Authentication → Sign-in method → Activar **Correo/contraseña**.

### 4.2 Reglas de Firestore

Firebase Console → Firestore Database → Reglas → Pegar y publicar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /emotionRecords/{date} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /achievements/{aid} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == uid;
      }
    }
    match /friendRequests/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4.3 Reglas de Storage

Firebase Console → Storage → Reglas → Pegar y publicar:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePhotos/{file} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && file == request.auth.uid + ".jpg"
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 5. Configurar variables de entorno del sistema (Windows)

Abre PowerShell y ejecuta:

```powershell
# Java (usa la ruta de tu Android Studio)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Android SDK
$env:ANDROID_HOME = "C:\Users\<TuUsuario>\AppData\Local\Android\Sdk"
```

Para hacerlo permanente (PowerShell como Administrador):

```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "Machine")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\<TuUsuario>\AppData\Local\Android\Sdk", "Machine")
```

---

## 6. Iniciar la aplicación

### Opción A — Build nativo (recomendado)

Conecta un dispositivo Android o abre un emulador, luego:

```powershell
npx expo run:android
```

Esto compila e instala la app directamente. Las siguientes veces puedes usar solo `npx expo start` y abrir la app ya instalada.

### Opción B — Expo Go (funcionalidad limitada)

```bash
npx expo start
```

Escanea el QR con la app **Expo Go**. Algunas funciones nativas no estarán disponibles.

---

## 7. Scripts disponibles

| Comando              | Descripción                            |
| -------------------- | -------------------------------------- |
| `npm run start`      | Inicia el servidor de desarrollo       |
| `npm run android`    | Inicia en emulador/dispositivo Android |
| `npm run test`       | Ejecuta los tests unitarios            |
| `npm run test:watch` | Tests en modo watch                    |
| `npm run lint`       | Comprueba el código con ESLint         |
