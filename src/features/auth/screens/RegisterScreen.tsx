import { useState } from "react";
import { Button, Input, Label, Spinner, Text, View, YStack, XStack } from "tamagui";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../stores/useAuthStore";
import { PasswordInput } from "../../../shared/components/PasswordInput";

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
    else if (confirm !== password) errors.confirm = "Las contraseñas no coinciden";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister() {
    clearError();
    if (!validate()) return;
    await register(email.trim(), password, nombre.trim());
  }

  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" paddingHorizontal="$space.lg">
      {/* Logo / Title */}
      <YStack alignItems="center" marginBottom="$space.xl">
        <Text fontFamily="$heading" fontSize={36} color="$primary" fontWeight="700">
          MoodPulse
        </Text>
        <Text color="$color" opacity={0.6} marginTop="$space.xs">
          Crea tu cuenta
        </Text>
      </YStack>

      <YStack gap="$space.md">
        {/* Nombre */}
        <YStack gap="$space.xs">
          <Label color="$color" htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              if (fieldErrors.nombre) setFieldErrors((p) => ({ ...p, nombre: undefined }));
            }}
            placeholder="Tu nombre"
            autoCapitalize="words"
            backgroundColor="$input"
            borderRadius="$md"
            borderColor={fieldErrors.nombre ? "$error" : "$borderColor"}
            placeholderTextColor="$placeholderColor"
          />
          {fieldErrors.nombre && (
            <Text color="$error" fontSize={14}>{fieldErrors.nombre}</Text>
          )}
        </YStack>

        {/* Email */}
        <YStack gap="$space.xs">
          <Label color="$color" htmlFor="email">Correo electrónico</Label>
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
            <Text color="$error" fontSize={14}>{fieldErrors.email}</Text>
          )}
        </YStack>

        {/* Password */}
        <YStack gap="$space.xs">
          <Label color="$color" htmlFor="password">Contraseña</Label>
          <PasswordInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="Contraseña (mín. 8 caracteres)"
            borderColor={fieldErrors.password ? "#E74C3C" : undefined}
          />
          {fieldErrors.password && (
            <Text color="$error" fontSize={14}>{fieldErrors.password}</Text>
          )}
        </YStack>

        {/* Confirm password */}
        <YStack gap="$space.xs">
          <Label color="$color" htmlFor="confirm">Confirmar contraseña</Label>
          <PasswordInput
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined }));
            }}
            placeholder="Confirmar contraseña"
            borderColor={fieldErrors.confirm ? "#E74C3C" : undefined}
          />
          {fieldErrors.confirm && (
            <Text color="$error" fontSize={14}>{fieldErrors.confirm}</Text>
          )}
        </YStack>

        {/* Store-level error */}
        {error && (
          <Text color="$error" fontSize={14} textAlign="center">{error}</Text>
        )}

        {/* Submit */}
        <Button
          onPress={handleRegister}
          disabled={loading}
          backgroundColor="$primary"
          borderRadius="$md"
          marginTop="$space.sm"
          icon={loading ? <Spinner color="white" /> : undefined}
        >
          <Text color="white" fontWeight="600">
            {loading ? "" : "Crear cuenta"}
          </Text>
        </Button>
      </YStack>

      {/* Back to login */}
      <XStack alignItems="center" justifyContent="center" marginTop="$space.xl" gap="$space.xs">
        <Text color="$color" opacity={0.6}>¿Ya tienes cuenta?</Text>
        <Text color="$primary" fontWeight="600" onPress={() => router.back()}>
          Inicia sesión
        </Text>
      </XStack>
    </View>
  );
}
