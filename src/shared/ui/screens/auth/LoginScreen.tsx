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
import { useAuthStore } from "../../stores/useAuthStore";
import { PasswordInput } from "../../components/PasswordInput";

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
    <View flex={1} backgroundColor="$background">
      {/* Branded top band */}
      <View
        backgroundColor="$primary"
        paddingTop={70}
        paddingBottom={48}
        paddingHorizontal="$space.lg"
        alignItems="center"
      >
        <Text fontFamily="$heading" fontSize={38} color="white" fontWeight="700" letterSpacing={-1}>
          MoodPulse
        </Text>
        <Text color="white" opacity={0.8} marginTop={6} fontSize={14}>
          Tu diario emocional inteligente
        </Text>
      </View>

      {/* Form card overlapping the band */}
      <View
        flex={1}
        backgroundColor="$background"
        borderTopLeftRadius={28}
        borderTopRightRadius={28}
        marginTop={-20}
        paddingHorizontal="$space.lg"
        paddingTop="$space.xl"
      >
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
            borderRadius={9999}
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
            borderRadius={9999}
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
    </View>
  );
}
