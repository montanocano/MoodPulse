import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { Button, Spinner, Text, View, YStack } from "tamagui";
import { sendEmailVerification, reload } from "firebase/auth";
import { auth } from "../../../api/firebase";
import { useAuthStore } from "../../../../features/auth/store/authStore";

export default function VerifyEmailScreen() {
  const { user, setUser, signOut } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const appState = useRef(AppState.currentState);

  // Poll emailVerified when app comes back to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await reload(currentUser);
            if (currentUser.emailVerified) {
              setUser(currentUser);
            }
          }
        }
        appState.current = nextState;
      },
    );
    return () => subscription.remove();
  }, [setUser]);

  async function handleResend() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setSending(true);
    try {
      await sendEmailVerification(currentUser);
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <View
      flex={1}
      backgroundColor="$background"
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="$space.lg"
    >
      <YStack alignItems="center" gap="$space.lg" maxWidth={400}>
        <Text
          fontFamily="$heading"
          fontSize={28}
          color="$primary"
          textAlign="center"
        >
          Verifica tu correo
        </Text>

        <Text color="$color" opacity={0.7} textAlign="center" fontSize={16}>
          Hemos enviado un correo de verificación a{" "}
          <Text color="$primary" fontWeight="600">
            {user?.email ?? "tu dirección de correo"}
          </Text>
          . Ábrelo y pulsa el enlace para continuar.
        </Text>

        <Text color="$color" opacity={0.5} textAlign="center" fontSize={14}>
          Cuando hayas verificado tu correo, vuelve a la app y se actualizará
          automáticamente.
        </Text>

        {sent && (
          <Text color="$emotionGrateful" fontSize={14} textAlign="center">
            Correo reenviado correctamente
          </Text>
        )}

        <Button
          onPress={handleResend}
          disabled={sending}
          backgroundColor="$primary"
          borderRadius={9999}
          width="100%"
          icon={sending ? <Spinner color="white" /> : undefined}
        >
          <Text color="white" fontWeight="600">
            {sending ? "" : "Reenviar correo"}
          </Text>
        </Button>

        <Text
          color="$color"
          opacity={0.5}
          onPress={() => signOut()}
          marginTop="$space.sm"
        >
          Cerrar sesión
        </Text>
      </YStack>
    </View>
  );
}
