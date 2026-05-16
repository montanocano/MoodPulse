import { useState } from "react";
import { Alert, TextInput } from "react-native";
import { Text, View, YStack, useTheme } from "tamagui";
import { AppButton } from "../../components/AppButton";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PasswordInput } from "../../components/PasswordInput";
import { deleteAccount } from "../../../utils/deleteAccountHelper";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import { useEmotionStore } from "../../../../features/emotion/store/emotionStore";
import { useSettingsStore } from "../../../../features/settings/store/settingsStore";

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);

  function validate(): boolean {
    let valid = true;
    if (!email.trim()) {
      setEmailError("El correo no puede estar vacío");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!password) {
      setPasswordError("La contraseña no puede estar vacía");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  }

  async function handleDelete() {
    if (!validate()) return;
    setLoading(true);
    try {
      await deleteAccount(email.trim(), password);
      // Reset all stores
      setUser(null);
      useEmotionStore.setState({
        todayRecord: null,
        records: [],
        loading: false,
        error: null,
      });
      useSettingsStore.setState({
        theme: "light",
        reminderEnabled: false,
        reminderTime: "20:00",
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/user-mismatch"
      ) {
        Alert.alert(
          "Error",
          "Credenciales incorrectas. No se ha eliminado la cuenta.",
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingHorizontal="$space.lg"
    >
      <YStack gap="$space.lg">
        <YStack gap="$space.xs">
          <Text fontFamily="$heading" fontSize={22} color="$color">
            Eliminar cuenta
          </Text>
          <Text color="$color" opacity={0.6} fontSize={14}>
            Introduce tus credenciales para confirmar. Esta acción es
            irreversible.
          </Text>
        </YStack>

        <YStack gap="$space.sm">
          <Text fontSize={14} color="$color">
            Correo electrónico
          </Text>
          <View
            borderWidth={1}
            borderColor={emailError ? "$emotionAngry" : "$borderColor"}
            borderRadius="$md"
            backgroundColor="$input"
            paddingHorizontal="$space.md"
            height={44}
            justifyContent="center"
          >
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setEmailError("");
              }}
              placeholder="tu@correo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={theme.placeholderColor?.val as string}
              style={{
                color: theme.color?.val as string,
                fontSize: 16,
                flex: 1,
              }}
            />
          </View>
          {emailError ? (
            <Text color="$emotionAngry" fontSize={12}>
              {emailError}
            </Text>
          ) : null}
        </YStack>

        <YStack gap="$space.sm">
          <Text fontSize={14} color="$color">
            Contraseña
          </Text>
          <PasswordInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setPasswordError("");
            }}
            placeholder="Tu contraseña"
            borderColor={
              passwordError ? (theme.emotionAngry?.val as string) : undefined
            }
          />
          {passwordError ? (
            <Text color="$emotionAngry" fontSize={12}>
              {passwordError}
            </Text>
          ) : null}
        </YStack>

        <AppButton
          label={loading ? "Eliminando..." : "Eliminar mi cuenta"}
          onPress={handleDelete}
          disabled={loading || !email || !password}
          loading={loading}
          variant={email && password ? "danger-filled" : "danger"}
          shape="rounded"
          fullWidth
        />

        <AppButton
          label="Cancelar"
          onPress={() => router.back()}
          disabled={loading}
          variant="secondary"
          shape="rounded"
          fullWidth
        />
      </YStack>
    </View>
  );
}
