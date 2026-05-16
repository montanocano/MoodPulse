import { useState } from "react";
import { ScrollView } from "react-native";
import { Input, Text, View, YStack } from "tamagui";
import { AppButton } from "../../components/AppButton";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import { PasswordInput } from "../../components/PasswordInput";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface FieldErrors {
  nombre?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, loading, error, clearError } = useAuthStore();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!email.trim()) errors.email = "El correo es obligatorio";
    else if (!validateEmail(email)) errors.email = "Formato de correo inválido";
    if (!password) errors.password = "La contraseña es obligatoria";
    else if (password.length < 8)
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    if (!confirm) errors.confirm = "Confirma tu contraseña";
    else if (confirm !== password)
      errors.confirm = "Las contraseñas no coinciden";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister() {
    clearError();
    if (!validate()) return;
    await register(email.trim(), password, nombre.trim());
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
            Registro
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
            {/* Nombre */}
            <Input
              value={nombre}
              onChangeText={(t) => {
                setNombre(t);
                if (fieldErrors.nombre)
                  setFieldErrors((p) => ({ ...p, nombre: undefined }));
              }}
              placeholder="Nombre"
              autoCapitalize="words"
              backgroundColor="$surface"
              borderRadius="$md"
              borderColor={fieldErrors.nombre ? "$error" : "$borderColor"}
              placeholderTextColor="$placeholderColor"
              height={48}
            />
            {fieldErrors.nombre && (
              <Text color="$error" fontSize={12} marginTop={-6}>
                {fieldErrors.nombre}
              </Text>
            )}

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

            {/* Contraseña */}
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

            {/* Repetir contraseña */}
            <PasswordInput
              value={confirm}
              onChangeText={(t) => {
                setConfirm(t);
                if (fieldErrors.confirm)
                  setFieldErrors((p) => ({ ...p, confirm: undefined }));
              }}
              placeholder="Repetir contraseña"
              borderColor={fieldErrors.confirm ? "$error" : undefined}
            />
            {fieldErrors.confirm && (
              <Text color="$error" fontSize={12} marginTop={-6}>
                {fieldErrors.confirm}
              </Text>
            )}

            {/* Store-level error */}
            {error && (
              <Text color="$error" fontSize={13} textAlign="center">
                {error}
              </Text>
            )}

            <AppButton
              label="Registrarse"
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              variant="primary"
              shape="pill"
              size="lg"
              fullWidth
            />
          </YStack>

          {/* Back link */}
          <Text
            color="$primary"
            fontWeight="600"
            fontSize={14}
            onPress={() => router.back()}
          >
            Volver
          </Text>
        </YStack>
      </ScrollView>
    </View>
  );
}
