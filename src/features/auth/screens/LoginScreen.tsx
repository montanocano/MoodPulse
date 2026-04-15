import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  Spinner,
  Text,
  View,
  YStack,
  XStack,
} from "tamagui";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useAuthStore } from "../../../stores/useAuthStore";
import { PasswordInput } from "../../../shared/components/PasswordInput";

WebBrowser.maybeCompleteAuthSession();

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [_request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params.id_token;
      if (idToken) {
        signInWithGoogle(idToken);
      }
    }
  }, [response]);

  function validate() {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "El correo es obligatorio";
    else if (!validateEmail(email)) errors.email = "Formato de correo inválido";
    if (!password) errors.password = "La contraseña es obligatoria";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSignIn() {
    clearError();
    if (!validate()) return;
    await signIn(email.trim(), password);
  }

  async function handleGoogleSignIn() {
    clearError();
    await promptAsync();
  }

  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" paddingHorizontal="$space.lg">
      {/* Logo / Title */}
      <YStack alignItems="center" marginBottom="$space.xl">
        <Text
          fontFamily="$heading"
          fontSize={36}
          color="$primary"
          fontWeight="700"
        >
          MoodPulse
        </Text>
        <Text color="$color" opacity={0.6} marginTop="$space.xs">
          Tu diario emocional inteligente
        </Text>
      </YStack>

      <YStack gap="$space.md">
        {/* Email */}
        <YStack gap="$space.xs">
          <Label color="$color" htmlFor="email">
            Correo electrónico
          </Label>
          <Input
            id="email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            backgroundColor="$input"
            borderRadius="$md"
            borderColor={fieldErrors.email ? "$error" : "$borderColor"}
            placeholderTextColor="$placeholderColor"
          />
          {fieldErrors.email && (
            <Text color="$error" fontSize={14}>
              {fieldErrors.email}
            </Text>
          )}
        </YStack>

        {/* Password */}
        <YStack gap="$space.xs">
          <Label color="$color" htmlFor="password">
            Contraseña
          </Label>
          <PasswordInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (fieldErrors.password)
                setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="Contraseña"
            borderColor={fieldErrors.password ? "#E74C3C" : undefined}
          />
          {fieldErrors.password && (
            <Text color="$error" fontSize={14}>
              {fieldErrors.password}
            </Text>
          )}
        </YStack>

        {/* Store-level error */}
        {error && (
          <Text color="$error" fontSize={14} textAlign="center">
            {error}
          </Text>
        )}

        {/* Sign In button */}
        <Button
          onPress={handleSignIn}
          disabled={loading}
          backgroundColor="$primary"
          borderRadius="$md"
          marginTop="$space.sm"
          icon={loading ? <Spinner color="white" /> : undefined}
        >
          <Text color="white" fontWeight="600">
            {loading ? "" : "Iniciar sesión"}
          </Text>
        </Button>

        {/* Google Sign-In */}
        <Button
          onPress={handleGoogleSignIn}
          disabled={loading}
          backgroundColor="$surface"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text color="$color" fontWeight="600">
            Continuar con Google
          </Text>
        </Button>
      </YStack>

      {/* Navigation links */}
      <YStack alignItems="center" marginTop="$space.xl" gap="$space.md">
        <XStack gap="$space.xs">
          <Text color="$color" opacity={0.6}>
            ¿No tienes cuenta?
          </Text>
          <Text
            color="$primary"
            fontWeight="600"
            onPress={() => router.push("/(auth)/register")}
          >
            Regístrate
          </Text>
        </XStack>

        <Text
          color="$primary"
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          ¿Olvidaste tu contraseña?
        </Text>
      </YStack>
    </View>
  );
}
