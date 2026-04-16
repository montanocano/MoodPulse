import { useState, useCallback } from "react";
import { ScrollView } from "react-native";
import { Button, Text, View, YStack, XStack } from "tamagui";
import { useRouter, useFocusEffect } from "expo-router";
import { EmotionType, EMOTION_CONFIG } from "../../../../types/emotion";
import { useEmotionStore } from "../../stores/useEmotionStore";
import EmotionCard from "../../../../features/emotion/widgets/EmotionCard";
import IntensitySlider from "../../../../features/emotion/widgets/IntensitySlider";

export default function EmotionPickerScreen() {
  const router = useRouter();
  const todayRecord = useEmotionStore((s) => s.todayRecord);

  const [editMode, setEditMode] = useState(false);

  // Resetear modo edición cada vez que la pantalla recibe el foco,
  // así al volver tras guardar en ReflectionScreen se muestra la vista de solo lectura.
  useFocusEffect(
    useCallback(() => {
      setEditMode(false);
    }, [])
  );
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(
    todayRecord?.emotion ?? null
  );
  const [intensity, setIntensity] = useState<number>(todayRecord?.intensity ?? 5);

  const isReadOnly = !!todayRecord && !editMode;
  const emotions = Object.keys(EMOTION_CONFIG) as EmotionType[];
  const accentColor = selectedEmotion
    ? EMOTION_CONFIG[selectedEmotion].colorValue
    : "#6C5CE7";

  function handleNext() {
    if (!selectedEmotion) return;
    router.push({
      pathname: "/(app)/reflection",
      params: {
        emotion: selectedEmotion,
        intensity: String(intensity),
        isEdit: todayRecord ? "true" : "false",
      },
    });
  }

  // ── Read-only view when today's record exists ────────────────────
  if (isReadOnly && todayRecord) {
    const config = EMOTION_CONFIG[todayRecord.emotion];
    return (
      <View flex={1} backgroundColor="$background" paddingTop={60} paddingHorizontal="$space.lg">
        <YStack gap="$space.lg" alignItems="center">
          <XStack alignItems="center" gap={10}>
            <View width={3} height={22} backgroundColor="$primary" borderRadius={2} />
            <Text fontFamily="$heading" fontSize={22} color="$color">
              Ya registraste tu emoción hoy
            </Text>
          </XStack>

          <View
            backgroundColor={config.colorValue + "18"}
            borderRadius={20}
            padding="$space.xl"
            alignItems="center"
            width="100%"
            borderWidth={1.5}
            borderColor={config.colorValue + "66"}
          >
            <Text fontSize={64}>{config.emoji}</Text>
            <Text
              fontFamily="$heading"
              fontSize={24}
              color={config.colorValue}
              marginTop="$space.sm"
            >
              {config.label}
            </Text>
            <Text color="$color" opacity={0.6} marginTop="$space.xs">
              Intensidad: {todayRecord.intensity}/10
            </Text>
            {todayRecord.reflection ? (
              <Text
                color="$color"
                opacity={0.8}
                marginTop="$space.md"
                textAlign="center"
                fontSize={14}
                numberOfLines={3}
              >
                "{todayRecord.reflection}"
              </Text>
            ) : null}
          </View>

          <Button
            onPress={() => {
              setSelectedEmotion(todayRecord.emotion);
              setIntensity(todayRecord.intensity);
              setEditMode(true);
            }}
            backgroundColor="$primary"
            borderRadius={9999}
            width="100%"
          >
            <Text color="white" fontWeight="600">
              Editar registro
            </Text>
          </Button>
        </YStack>
      </View>
    );
  }

  // ── Creation / edit view ─────────────────────────────────────────
  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView
        contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$space.lg">
          <YStack gap="$space.xs">
            <XStack alignItems="center" gap={10}>
              <View width={3} height={26} backgroundColor="$primary" borderRadius={2} />
              <Text fontFamily="$heading" fontSize={24} color="$color">
                {editMode ? "Editar emoción" : "¿Cómo te sientes hoy?"}
              </Text>
            </XStack>
            <Text color="$color" opacity={0.5} fontSize={14} marginLeft={13}>
              Selecciona la emoción que mejor te describe ahora mismo
            </Text>
          </YStack>

          {/* Emotion grid */}
          <XStack flexWrap="wrap" gap="$space.sm" justifyContent="space-between">
            {emotions.map((emotion) => (
              <EmotionCard
                key={emotion}
                emotion={emotion}
                selected={selectedEmotion === emotion}
                anySelected={selectedEmotion !== null}
                onPress={setSelectedEmotion}
              />
            ))}
          </XStack>

          {/* Intensity slider — shown once an emotion is selected */}
          {selectedEmotion && (
            <YStack gap="$space.sm">
              <XStack alignItems="center" gap={10}>
                <View width={3} height={18} backgroundColor={accentColor} borderRadius={2} />
                <Text fontFamily="$heading" fontSize={16} color="$color">
                  Intensidad
                </Text>
              </XStack>
              <IntensitySlider
                value={intensity}
                onChange={setIntensity}
                accentColor={EMOTION_CONFIG[selectedEmotion].colorValue}
              />
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Sticky bottom button */}
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
          onPress={handleNext}
          disabled={!selectedEmotion}
          backgroundColor={selectedEmotion ? accentColor : "$borderColor"}
          borderRadius={9999}
          size="$lg"
          opacity={selectedEmotion ? 1 : 0.5}
        >
          <Text color="white" fontWeight="600" fontSize={16}>
            Siguiente
          </Text>
        </Button>
      </View>
    </View>
  );
}
