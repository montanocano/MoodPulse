import { useState } from "react";
import { ScrollView } from "react-native";
import { Input, Text, View, YStack, XStack } from "tamagui";
import { AppButton } from "../../components/AppButton";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import { PasswordInput } from "../../components/PasswordInput";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

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

  return (
    <View flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 32,
          paddingVertical: 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <YStack alignItems="center" gap={28}>
          {/* Title */}
          <Text
            fontFamily="$heading"
            fontSize={34}
            color="$color"
            fontWeight="700"
            letterSpacing={-0.5}
          >
            Bienvenido
          </Text>

          {/* Logo */}
          <View
            backgroundColor="$primary"
            width={90}
            height={90}
            borderRadius={20}
            alignItems="center"
            justifyContent="center"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.18}
            shadowRadius={8}
            style={{ elevation: 6 }}
          >
            <Text
              color="white"
              fontFamily="$heading"
              fontSize={26}
              fontWeight="700"
            >
              M.p
            </Text>
          </View>

          {/* Form */}
          <YStack gap={12} width="100%">
            {/* Email */}
            <Input
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (fieldErrors.email)
                  setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              backgroundColor="$surface"
              borderRadius="$md"
              borderColor={fieldErrors.email ? "$error" : "$borderColor"}
              placeholderTextColor="$placeholderColor"
              height={48}
            />
            {fieldErrors.email && (
              <Text color="$error" fontSize={12} marginTop={-6}>
                {fieldErrors.email}
              </Text>
            )}

            {/* Password */}
            <PasswordInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (fieldErrors.password)
                  setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="Contraseña"
              borderColor={fieldErrors.password ? "$error" : undefined}
            />
            {fieldErrors.password && (
              <Text color="$error" fontSize={12} marginTop={-6}>
                {fieldErrors.password}
              </Text>
            )}

            {/* Store-level error */}
            {error && (
              <Text color="$error" fontSize={13} textAlign="center">
                {error}
              </Text>
            )}

            <AppButton
              label="Iniciar Sesión"
              onPress={handleSignIn}
              disabled={loading}
              loading={loading}
              variant="primary"
              shape="pill"
              size="lg"
              fullWidth
            />
          </YStack>

          {/* Navigation links */}
          <YStack alignItems="center" gap={12}>
            <Text
              color="$primary"
              fontWeight="600"
              fontSize={14}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </Text>
            <XStack gap={6}>
              <Text color="$color" opacity={0.6} fontSize={14}>
                ¿No tienes cuenta?
              </Text>
              <Text
                color="$primary"
                fontWeight="700"
                fontSize={14}
                onPress={() => router.push("/(auth)/register")}
              >
                Regístrate
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
