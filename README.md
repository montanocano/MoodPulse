# MoodPulse

Aplicación móvil de diario emocional con IA, desarrollada con React Native (Expo), Tamagui, Zustand y Firebase.

## Requisitos previos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Cuenta en [Firebase Console](https://console.firebase.google.com/)
- Clave de API de [Google AI Studio](https://aistudio.google.com/) (Gemini)

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Clave de API del proyecto Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth de Firebase |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de Storage Firebase |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de Firebase Messaging |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID de Firebase |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Clave de API de Gemini 1.5 Flash (Google AI Studio) |

## Inicio rápido

```bash
npm install
npx expo start
```

## Reglas de seguridad de Firestore

Las reglas de seguridad deben desplegarse manualmente desde la Firebase Console o con Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

El archivo `firestore.rules` contiene las reglas necesarias. La regla clave para Sprint 2:

```
match /users/{uid}/emotionRecords/{date} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

**Paso manual:** Ve a Firebase Console → Firestore → Rules, pega el contenido de `firestore.rules` y publica.
