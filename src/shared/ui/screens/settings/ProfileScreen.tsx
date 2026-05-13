import { useState, useEffect } from "react";
import { Alert, Linking, ScrollView, TextInput } from "react-native";
import {
  Button,
  Text,
  View,
  YStack,
  XStack,
  Switch,
  Input,
  useTheme,
} from "tamagui";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import { useSettingsStore } from "../../../../features/settings/store/settingsStore";
import { uploadProfilePhoto } from "../../../utils/uploadProfilePhoto";
import * as notificationService from "../../../utils/notificationHelper";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    user,
    signOut,
    loading,
    updateDisplayName,
    loadAchievements,
    achievements,
  } = useAuthStore();
  const {
    theme: appTheme,
    setTheme,
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
  } = useSettingsStore();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.displayName ?? "");
  const [nameError, setNameError] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(
    user?.photoURL ?? null,
  );
  const [photoLoading, setPhotoLoading] = useState(false);
  const [timeInput, setTimeInput] = useState(reminderTime);

  useEffect(() => {
    if (user?.uid) {
      void loadAchievements(user.uid);
    }
  }, [user?.uid, loadAchievements]);

  // ── Initials fallback ──────────────────────────────────────────────
  const initials = (user?.displayName ?? user?.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  // ── Save display name ──────────────────────────────────────────────
  async function handleSaveName() {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameError("El nombre no puede estar vacío");
      return;
    }
    setNameError("");
    setNameLoading(true);
    try {
      await updateDisplayName(trimmed);
      setEditingName(false);
    } catch {
      Alert.alert(
        "Error",
        "No se pudo actualizar el nombre. Inténtalo de nuevo.",
      );
    } finally {
      setNameLoading(false);
    }
  }

  // ── Photo picker ───────────────────────────────────────────────────
  async function handlePhotoPress() {
    Alert.alert("Cambiar foto", "Elige una opción", [
      {
        text: "Cámara",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            await doUpload(result.assets[0].uri);
          }
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            mediaTypes: "images",
          });
          if (!result.canceled && result.assets[0]) {
            await doUpload(result.assets[0].uri);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  async function doUpload(uri: string) {
    if (!user?.uid) return;
    setPhotoLoading(true);
    const prev = photoUri;
    setPhotoUri(uri);
    try {
      const url = await uploadProfilePhoto(uri, user.uid);
      setPhotoUri(url);
    } catch (err) {
      console.error("[uploadPhoto] error:", err);
      setPhotoUri(prev);
      Alert.alert("Error", "No se pudo subir la foto. Inténtalo de nuevo.");
    } finally {
      setPhotoLoading(false);
    }
  }

  // ── Theme toggle ───────────────────────────────────────────────────
  function handleThemeToggle(checked: boolean) {
    setTheme(checked ? "dark" : "light");
  }

  // ── Reminder toggle ────────────────────────────────────────────────
  async function handleReminderToggle(enabled: boolean) {
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permisos denegados",
          "Activa los permisos de notificación en Ajustes para usar recordatorios.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ajustes", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const [h, m] = reminderTime.split(":").map(Number);
      await notificationService.scheduleDaily(h, m);
      setReminderEnabled(true);
      Alert.alert(
        "Recordatorio",
        `Recordatorio configurado a las ${reminderTime}`,
      );
    } else {
      await notificationService.cancelAll();
      setReminderEnabled(false);
    }
  }

  async function handleReminderTimeChange(time: string) {
    setTimeInput(time);
    if (/^\d{2}:\d{2}$/.test(time)) {
      setReminderTime(time);
      if (reminderEnabled) {
        const [h, m] = time.split(":").map(Number);
        await notificationService.scheduleDaily(h, m);
      }
    }
  }

  // ── Sign out ───────────────────────────────────────────────────────
  function handleSignOut() {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => signOut() },
    ]);
  }

  // ── Delete account ─────────────────────────────────────────────────
  function handleDeleteAccount() {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro? Esta acción es irreversible y se borrarán todos tus datos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => (router as any).push("/delete-account"),
        },
      ],
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background?.val as string }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 40,
      }}
    >
      <YStack gap="$space.lg">
        {/* ── Avatar ────────────────────────────────────────────────── */}
        <YStack alignItems="center" gap="$space.md">
          <Button
            unstyled
            onPress={handlePhotoPress}
            disabled={photoLoading}
            pressStyle={{ opacity: 0.7 }}
          >
            <View
              width={88}
              height={88}
              borderRadius={44}
              backgroundColor="$primary"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 88, height: 88, borderRadius: 44 }}
                />
              ) : (
                <Text color="$white" fontWeight="700" fontSize={30}>
                  {initials}
                </Text>
              )}
            </View>
          </Button>
          <Text color="$color" opacity={0.5} fontSize={12}>
            {photoLoading ? "Subiendo..." : "Toca para cambiar la foto"}
          </Text>
        </YStack>

        {/* ── Display name ──────────────────────────────────────────── */}
        <YStack
          backgroundColor="$surface"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$space.md"
          gap="$space.sm"
        >
          <Text
            fontFamily="$heading"
            fontSize={14}
            color="$color"
            opacity={0.6}
          >
            NOMBRE
          </Text>
          {editingName ? (
            <YStack gap="$space.xs">
              <Input
                value={nameValue}
                onChangeText={(t) => {
                  setNameValue(t);
                  setNameError("");
                }}
                placeholder="Tu nombre"
                autoFocus
                borderColor={nameError ? "$emotionAngry" : "$borderColor"}
              />
              {nameError ? (
                <Text color="$emotionAngry" fontSize={12}>
                  {nameError}
                </Text>
              ) : null}
              <XStack gap="$space.sm" marginTop="$space.xs">
                <Button
                  flex={1}
                  onPress={handleSaveName}
                  disabled={nameLoading}
                  backgroundColor="$primary"
                  borderRadius="$md"
                >
                  <Text color="$white" fontWeight="600">
                    Guardar
                  </Text>
                </Button>
                <Button
                  flex={1}
                  onPress={() => {
                    setEditingName(false);
                    setNameError("");
                    setNameValue(user?.displayName ?? "");
                  }}
                  backgroundColor="$surface"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$md"
                >
                  <Text color="$color">Cancelar</Text>
                </Button>
              </XStack>
            </YStack>
          ) : (
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16} color="$color">
                {user?.displayName ?? "Sin nombre"}
              </Text>
              <Button
                unstyled
                onPress={() => {
                  setEditingName(true);
                  setNameValue(user?.displayName ?? "");
                }}
                pressStyle={{ opacity: 0.6 }}
              >
                <Text color="$primary" fontSize={14}>
                  Editar
                </Text>
              </Button>
            </XStack>
          )}
          <Text color="$color" opacity={0.4} fontSize={13}>
            {user?.email}
          </Text>
        </YStack>

        {/* ── Achievements ──────────────────────────────────────────── */}
        <YStack
          backgroundColor="$surface"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$space.md"
          gap="$space.sm"
        >
          <Text
            fontFamily="$heading"
            fontSize={14}
            color="$color"
            opacity={0.6}
          >
            LOGROS
          </Text>
          {achievements.length === 0 ? (
            <Text color="$color" opacity={0.5} fontSize={14}>
              Aún no tienes logros. ¡Sigue registrando!
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$space.sm">
                {achievements.map((a) => (
                  <YStack
                    key={a.type}
                    alignItems="center"
                    backgroundColor="$background"
                    borderRadius="$md"
                    paddingHorizontal="$space.sm"
                    paddingVertical="$space.xs"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontSize={22}>{a.emoji ?? "🏆"}</Text>
                    <Text
                      fontSize={11}
                      color="$color"
                      opacity={0.7}
                      textAlign="center"
                      maxWidth={70}
                    >
                      {a.titulo}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </ScrollView>
          )}
        </YStack>

        {/* ── Theme ─────────────────────────────────────────────────── */}
        <YStack
          backgroundColor="$surface"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$space.md"
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={16} color="$color">
              Tema oscuro
            </Text>
            <Switch
              checked={appTheme === "dark"}
              onCheckedChange={handleThemeToggle}
              backgroundColor={
                appTheme === "dark" ? "$primary" : "$borderColor"
              }
            >
              <Switch.Thumb />
            </Switch>
          </XStack>
        </YStack>

        {/* ── Reminders ─────────────────────────────────────────────── */}
        <YStack
          backgroundColor="$surface"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$space.md"
          gap="$space.sm"
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={16} color="$color">
              Recordatorio diario
            </Text>
            <Switch
              checked={reminderEnabled}
              onCheckedChange={handleReminderToggle}
              backgroundColor={reminderEnabled ? "$primary" : "$borderColor"}
            >
              <Switch.Thumb />
            </Switch>
          </XStack>
          {reminderEnabled && (
            <XStack alignItems="center" gap="$space.sm">
              <Text fontSize={14} color="$color" opacity={0.7}>
                Hora:
              </Text>
              <View
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$sm"
                paddingHorizontal="$space.sm"
                backgroundColor="$background"
              >
                <TextInput
                  value={timeInput}
                  onChangeText={handleReminderTimeChange}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                  style={{
                    color: theme.color?.val as string,
                    fontSize: 16,
                    paddingVertical: 6,
                    minWidth: 60,
                    textAlign: "center",
                  }}
                  placeholderTextColor={theme.placeholderColor?.val as string}
                />
              </View>
            </XStack>
          )}
        </YStack>

        {/* ── Sign out ──────────────────────────────────────────────── */}
        <Button
          onPress={handleSignOut}
          disabled={loading}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$md"
        >
          <Text color="$color">Cerrar sesión</Text>
        </Button>

        {/* ── Delete account ────────────────────────────────────────── */}
        <Button
          onPress={handleDeleteAccount}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$emotionAngry"
          borderRadius="$md"
        >
          <Text color="$emotionAngry">Eliminar cuenta</Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}
