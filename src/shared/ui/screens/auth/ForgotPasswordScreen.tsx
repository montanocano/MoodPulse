import { useState } from "react";
import { Button, Input, Label, Spinner, Text, View, YStack } from "tamagui";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/useAuthStore";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordReset, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError("El correo es obligatorio");
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError("Formato de correo inválido");
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await sendPasswordReset(email.trim());
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center" paddingHorizontal="$space.lg">
        <YStack alignItems="center" gap="$space.lg" maxWidth={400}>
          <Text fontFamily="$heading" fontSize={28} color="$primary" textAlign="center">
            Correo enviado
          </Text>
          <Text color="$color" opacity={0.7} textAlign="center" fontSize={16}>
            Si el correo está registrado, recibirás un enlace para restablecer tu
            contraseña en breve. Revisa también la carpeta de spam.
          </Text>
          <Button
            onPress={() => router.back()}
            backgroundColor="$primary"
            borderRadius={9999}
            width="100%"
          >
            <Text color="white" fontWeight="600">Volver al login</Text>
          </Button>
        </YStack>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Branded top band */}
      <View
        backgroundColor="$primary"
        paddingTop={70}
        paddingBottom={48}
        paddingHorizontal="$space.lg"
      >
        <Text fontFamily="$heading" fontSize={26} color="white" fontWeight="700">
          Recuperar contraseña
        </Text>
        <Text color="white" opacity={0.8} marginTop={6} fontSize={14}>
          Introduce tu correo y te enviaremos un enlace para restablecerla.
        </Text>
      </View>

      {/* Form card */}
      <View
        backgroundColor="$background"
        borderTopLeftRadius={28}
        borderTopRightRadius={28}
        marginTop={-20}
        paddingHorizontal={24}
        paddingTop={32}
        flex={1}
      >
        <YStack gap="$space.md">
          <YStack gap="$space.xs">
            <Label color="$color" htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError(undefined);
              }}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              backgroundColor="$input"
              borderRadius="$md"
              borderColor={emailError ? "$error" : "$borderColor"}
              placeholderTextColor="$placeholderColor"
            />
            {emailError && (
              <Text color="$error" fontSize={14}>{emailError}</Text>
            )}
          </YStack>

          <Button
            onPress={handleSubmit}
            disabled={loading}
            backgroundColor="$primary"
            borderRadius={9999}
            marginTop="$space.sm"
            icon={loading ? <Spinner color="white" /> : undefined}
          >
            <Text color="white" fontWeight="600">
              {loading ? "" : "Enviar enlace"}
            </Text>
          </Button>

          <Text
            color="$primary"
            textAlign="center"
            marginTop="$space.sm"
            onPress={() => router.back()}
          >
            Volver al login
          </Text>
        </YStack>
      </View>
    </View>
  );
}
