import { Alert } from "react-native";
import { Button, Text, View, YStack } from "tamagui";
import { useAuthStore } from "../../src/shared/ui/stores/useAuthStore";

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuthStore();

  const initials = (user?.displayName ?? user?.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  function handleSignOut() {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => signOut() },
      ]
    );
  }

  return (
    <View
      flex={1}
      backgroundColor="$background"
      paddingTop={60}
      paddingHorizontal="$space.lg"
    >
      <YStack alignItems="center" gap="$space.lg">
        {/* Avatar circle — avoids Avatar.Fallback RC bug with New Architecture */}
        <View
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="$primary"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="white" fontWeight="700" fontSize={28}>
            {initials}
          </Text>
        </View>

        <YStack alignItems="center" gap="$space.xs">
          <Text fontFamily="$heading" fontSize={22} color="$color">
            {user?.displayName ?? "Usuario"}
          </Text>
          <Text color="$color" opacity={0.5} fontSize={14}>
            {user?.email}
          </Text>
        </YStack>

        <Button
          onPress={handleSignOut}
          disabled={loading}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$md"
          marginTop="$space.xl"
          width="100%"
        >
          <Text color="$color">Cerrar sesión</Text>
        </Button>
      </YStack>
    </View>
  );
}
