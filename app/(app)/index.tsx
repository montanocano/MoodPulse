import { useState } from "react";
import {
  AlertDialog,
  Button,
  Text,
  View,
  YStack,
  XStack,
} from "tamagui";
import { useAuthStore } from "../../src/stores/useAuthStore";

export default function HomeScreen() {
  const { user, signOut, loading } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);

  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center" paddingHorizontal="$space.lg">
      <YStack alignItems="center" gap="$space.lg">
        <Text fontFamily="$heading" fontSize={28} color="$primary">
          ¡Bienvenido!
        </Text>
        <Text color="$color" opacity={0.7} textAlign="center">
          Hola, {user?.displayName ?? user?.email}
        </Text>
        <Text color="$color" opacity={0.4} fontSize={14} textAlign="center">
          Sprint 2 añadirá el registro emocional aquí.
        </Text>

        <Button
          onPress={() => setShowDialog(true)}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$md"
          marginTop="$space.xl"
        >
          <Text color="$color">Cerrar sesión</Text>
        </Button>
      </YStack>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            key="content"
            bordered
            elevate
            enterStyle={{ opacity: 0, scale: 0.9 }}
            exitStyle={{ opacity: 0, scale: 0.95 }}
            backgroundColor="$surface"
            borderRadius="$lg"
            padding="$space.lg"
            maxWidth={340}
          >
            <YStack gap="$space.md">
              <AlertDialog.Title
                fontFamily="$heading"
                fontSize={20}
                color="$color"
              >
                Cerrar sesión
              </AlertDialog.Title>
              <AlertDialog.Description color="$color" opacity={0.7}>
                ¿Seguro que quieres cerrar sesión?
              </AlertDialog.Description>

              <XStack gap="$space.sm" justifyContent="flex-end">
                <AlertDialog.Cancel asChild>
                  <Button
                    backgroundColor="$surface"
                    borderWidth={1}
                    borderColor="$borderColor"
                    borderRadius="$md"
                  >
                    <Text color="$color">Cancelar</Text>
                  </Button>
                </AlertDialog.Cancel>

                <AlertDialog.Action asChild>
                  <Button
                    onPress={() => signOut()}
                    disabled={loading}
                    backgroundColor="$primary"
                    borderRadius="$md"
                  >
                    <Text color="white" fontWeight="600">
                      Cerrar sesión
                    </Text>
                  </Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </View>
  );
}
