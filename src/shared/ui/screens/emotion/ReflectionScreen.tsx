import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollView, Keyboard, Animated } from "react-native";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import { Button, Text, View, YStack, TextArea, Spinner } from "tamagui";
import { EmotionType, EMOTION_CONFIG } from "../../../../types/emotion";
import { useEmotionStore } from "../../../../features/emotion/store/emotionStore";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import { generateReflection } from "../../../api/geminiService";

export default function ReflectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    emotion: EmotionType;
    intensity: string;
    isEdit: string;
  }>();

  const emotion = params.emotion as EmotionType;
  const intensity = parseInt(params.intensity ?? "5", 10);
  const isEdit = params.isEdit === "true";

  const config = EMOTION_CONFIG[emotion] ?? EMOTION_CONFIG.neutral;

  const uid = useAuthStore((s) => s.user?.uid ?? "");
  const { saveRecord, updateRecord, error, clearError, todayRecord } =
    useEmotionStore();

  const [reflection, setReflection] = useState(
    isEdit ? (todayRecord?.reflection ?? "") : "",
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset state each time this screen comes into focus (it stays mounted as a tab).
  // todayRecord?.reflection is intentionally excluded from deps: including it would
  // cause useFocusEffect to re-fire when the optimistic update changes todayRecord
  // right after pressing Save — which resets `saved` back to false and cancels navigation.
  useFocusEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(() => {
      setSaved(false);
      setAiError(null);
      fadeAnim.setValue(0);
      setReflection(isEdit ? (todayRecord?.reflection ?? "") : "");
    }, [isEdit]),
  );

  // Navigate to history tab after the success animation plays
  useEffect(() => {
    if (saved) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        router.replace("/(app)/history");
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [saved, fadeAnim, router]);

  async function handleGenerateAI() {
    Keyboard.dismiss();
    setAiLoading(true);
    setAiError(null);
    try {
      const suggestion = await generateReflection(emotion, intensity);
      setReflection(suggestion);
    } catch {
      setAiError(
        "No se pudo conectar con la IA. Se ha insertado una reflexión de ayuda.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  function handleSave() {
    if (!uid) return;
    Keyboard.dismiss();

    // Fire-and-forget: the optimistic update in the store updates local state
    // immediately. We don't await the Firestore write because it can stall
    // waiting for server ack while the connection is unstable, leaving the
    // spinner stuck forever. The write runs in the background and retries.
    if (isEdit && todayRecord?.date) {
      void updateRecord(uid, todayRecord.date, {
        emotion,
        intensity,
        reflection,
      });
    } else {
      void saveRecord(uid, { emotion, intensity, reflection });
    }

    setSaved(true);
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Success overlay */}
      {saved && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: config.colorValue + "26",
            zIndex: 10,
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeAnim,
          }}
        >
          <YStack alignItems="center" gap="$space.md">
            <Text fontSize={64}>✅</Text>
            <Text
              fontFamily="$heading"
              fontSize={22}
              color="$color"
              textAlign="center"
            >
              ¡Registro guardado!
            </Text>
            <Text color="$color" opacity={0.5} fontSize={14}>
              Redirigiendo al historial…
            </Text>
          </YStack>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 16,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap="$space.lg">
          {/* Header */}
          <YStack gap="$space.xs">
            <XStackHeader emotion={emotion} intensity={intensity} />
            <Text color="$color" opacity={0.5} fontSize={14}>
              Escribe cómo te sientes o genera una reflexión con IA
            </Text>
          </YStack>

          {/* Text area */}
          <TextArea
            value={reflection}
            onChangeText={(text) => {
              setReflection(text);
              if (error) clearError();
            }}
            placeholder={config.placeholder}
            placeholderTextColor="$placeholderColor"
            backgroundColor="$surface"
            borderColor={aiError ? "$error" : "$borderColor"}
            borderRadius="$md"
            padding="$space.md"
            minHeight={160}
            fontSize={15}
            color="$color"
            textAlignVertical="top"
            autoFocus
          />

          {/* AI button */}
          <Button
            onPress={handleGenerateAI}
            disabled={aiLoading}
            backgroundColor={config.colorValue + "18"}
            borderWidth={1.5}
            borderColor={config.colorValue}
            borderRadius={9999}
          >
            {aiLoading ? (
              <Spinner size="small" color={config.colorValue} />
            ) : (
              <Text color={config.colorValue} fontWeight="600">
                ✨ Generar reflexión con IA
              </Text>
            )}
          </Button>

          {aiError && (
            <Text color="$error" fontSize={13} opacity={0.9}>
              {aiError}
            </Text>
          )}

          {/* Save error */}
          {error && (
            <Text color="$error" fontSize={13} opacity={0.9}>
              {error}
            </Text>
          )}
        </YStack>
      </ScrollView>

      {/* Sticky save button */}
      <View
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$space.lg"
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Button
          onPress={handleSave}
          disabled={saved}
          backgroundColor={config.colorValue}
          borderRadius={9999}
          size="$lg"
        >
          <Text color="white" fontWeight="600" fontSize={16}>
            {isEdit ? "Actualizar" : "Guardar"}
          </Text>
        </Button>
      </View>
    </View>
  );
}

// Small header row showing emotion + intensity badge with accent bar
function XStackHeader({
  emotion,
  intensity,
}: {
  emotion: EmotionType;
  intensity: number;
}) {
  const config = EMOTION_CONFIG[emotion];
  return (
    <View flexDirection="row" alignItems="center" gap={8}>
      <View
        width={3}
        height={36}
        backgroundColor={config.colorValue}
        borderRadius={2}
      />
      <Text fontSize={32}>{config.emoji}</Text>
      <View flex={1}>
        <Text fontFamily="$heading" fontSize={20} color="$color">
          {config.label}
        </Text>
      </View>
      <View
        backgroundColor={config.colorValue + "22"}
        borderRadius={9999}
        paddingHorizontal={10}
        paddingVertical={4}
        borderWidth={1}
        borderColor={config.colorValue}
      >
        <Text fontSize={13} fontWeight="700" color={config.colorValue}>
          {intensity}/10
        </Text>
      </View>
    </View>
  );
}
