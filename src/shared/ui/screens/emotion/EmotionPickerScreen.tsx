import { useState, useCallback } from "react";
import { ScrollView } from "react-native";
import { Button, Text, View, YStack, XStack } from "tamagui";
import { useRouter, useFocusEffect } from "expo-router";
import { EmotionType, EMOTION_CONFIG } from "../../../../types/emotion";
import { useEmotionStore } from "../../../../features/emotion/store/emotionStore";
import EmotionCard from "../../components/EmotionCard";
import IntensitySlider from "../../components/IntensitySlider";
import { tokens } from "../../tokens";

export default function EmotionPickerScreen() {
  const router = useRouter();
  const todayRecord = useEmotionStore((s) => s.todayRecord);

  const [editMode, setEditMode] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(
    todayRecord?.emotion ?? null,
  );
  const [intensity, setIntensity] = useState<number>(
    todayRecord?.intensity ?? 5,
  );

  useFocusEffect(
    useCallback(() => {
      setEditMode(false);
    }, []),
  );

  const isReadOnly = !!todayRecord && !editMode;
  const emotions = Object.keys(EMOTION_CONFIG) as EmotionType[];
  const accentColor = selectedEmotion
    ? EMOTION_CONFIG[selectedEmotion].colorValue
    : tokens.color.primary.val;

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

  // ── Read-only view ───────────────────────────────────────────────
  if (isReadOnly && todayRecord) {
    const config = EMOTION_CONFIG[todayRecord.emotion];
    return (
      <View
        flex={1}
        backgroundColor="$background"
        paddingTop={60}
        paddingHorizontal={24}
      >
        <YStack gap={24} alignItems="center">
          <Text
            fontFamily="$heading"
            fontSize={24}
            color="$color"
            textAlign="center"
          >
            Ya registraste tu emoción hoy
          </Text>

          <View
            backgroundColor={config.colorValue}
            borderRadius={24}
            paddingVertical={32}
            paddingHorizontal={40}
            alignItems="center"
            width="100%"
            style={{
              shadowColor: config.colorValue,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text fontSize={64}>{config.emoji}</Text>
            <Text
              fontFamily="$heading"
              fontSize={24}
              color="$white"
              marginTop={8}
            >
              {config.label}
            </Text>
            <Text color="$white" opacity={0.8} marginTop={4}>
              Intensidad: {todayRecord.intensity}/10
            </Text>
            {todayRecord.reflection ? (
              <Text
                color="$white"
                opacity={0.9}
                marginTop={12}
                textAlign="center"
                fontSize={14}
                numberOfLines={3}
              >
                &ldquo;{todayRecord.reflection}&rdquo;
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
            height={48}
            // @ts-expect-error color is valid via ButtonContext but absent from outer prop types
            color="$white"
            fontWeight="700"
          >
            Editar registro
          </Button>
        </YStack>
      </View>
    );
  }

  // ── Creation / edit view ─────────────────────────────────────────
  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap={24}>
          {/* Title */}
          <Text
            fontFamily="$heading"
            fontSize={22}
            color="$color"
            textAlign="center"
            fontWeight="700"
          >
            {editMode ? "Editar emoción" : "¿Cómo te sientes hoy?"}
          </Text>

          {/* Emotion grid — 4 columns */}
          <XStack flexWrap="wrap" gap={8} justifyContent="space-between">
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

          {/* Intensity slider — always visible */}
          <YStack gap={8}>
            <Text fontFamily="$heading" fontSize={16} color="$color">
              Intensidad:
            </Text>
            <IntensitySlider
              value={intensity}
              onChange={setIntensity}
              accentColor={accentColor}
            />
          </YStack>
        </YStack>
      </ScrollView>

      {/* Sticky bottom button */}
      <View
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal={20}
        paddingVertical={16}
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Button
          onPress={handleNext}
          disabled={!selectedEmotion}
          backgroundColor="$primary"
          borderRadius={9999}
          height={48}
          opacity={selectedEmotion ? 1 : 0.4}
          // @ts-expect-error color is valid via ButtonContext but absent from outer prop types
          color="$white"
          fontWeight="700"
          fontSize={15}
        >
          Siguiente
        </Button>
      </View>
    </View>
  );
}
