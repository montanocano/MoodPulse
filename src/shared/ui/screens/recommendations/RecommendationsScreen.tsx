import { useCallback } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import {
  View,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useTheme } from "tamagui";
import { useRecommendations } from "../../../../features/recommendations/hooks/useRecommendations";
import { useEmotionStore } from "../../../../features/emotion/store/emotionStore";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import type { Recommendation, RecommendationCategory } from "../../../../types/recommendation";

// ── Category metadata ──────────────────────────────────────────────────────

const CATEGORY_META: Record<
  RecommendationCategory,
  { label: string; emoji: string; color: string }
> = {
  mindfulness: { label: "Mindfulness", emoji: "🧘", color: "#4A90D9" },
  actividad: { label: "Actividad", emoji: "🏃", color: "#2ECC71" },
  lectura: { label: "Lectura", emoji: "📚", color: "#F39C12" },
};

// ── RecommendationCard ─────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  onToggle,
}: {
  rec: Recommendation;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const meta = CATEGORY_META[rec.categoria];

  return (
    <YStack
      marginBottom="$4"
      padding="$4"
      borderRadius="$lg"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
      opacity={rec.completada ? 0.5 : 1}
    >
      <YStack gap="$2">
        {/* Header row: emoji + category badge */}
        <XStack alignItems="center" gap="$2">
          <Text fontSize={28}>{meta.emoji}</Text>
          <View
            paddingHorizontal={10}
            paddingVertical={3}
            borderRadius={999}
            backgroundColor={meta.color + "22"}
          >
            <Text
              fontSize={12}
              fontFamily="$body"
              color={meta.color}
              fontWeight="600"
            >
              {meta.label}
            </Text>
          </View>
        </XStack>

        {/* Title */}
        <Text
          fontFamily="$heading"
          fontSize={16}
          color="$color"
          fontWeight="700"
        >
          {rec.titulo}
        </Text>

        {/* Description */}
        <Text
          fontFamily="$body"
          fontSize={14}
          color="$color"
          opacity={0.7}
          lineHeight={20}
        >
          {rec.descripcion}
        </Text>

        {/* Toggle button */}
        <TouchableOpacity
          onPress={onToggle}
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: rec.completada
              ? (theme.primary?.val as string)
              : (theme.backgroundHover?.val as string),
          }}
        >
          <Ionicons
            name={rec.completada ? "checkmark-circle" : "checkmark-circle-outline"}
            size={18}
            color={rec.completada
              ? (theme.background?.val as string)
              : (theme.color?.val as string)}
          />
          <Text
            fontFamily="$body"
            fontSize={14}
            color={rec.completada ? "$background" : "$color"}
          >
            {rec.completada ? "Completada" : "Marcar como completada"}
          </Text>
        </TouchableOpacity>
      </YStack>
    </YStack>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const loadRecords = useEmotionStore((s) => s.loadRecords);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) loadRecords(user.uid);
    }, [user?.uid, loadRecords]),
  );

  const {
    recommendations,
    loading,
    error,
    hasStaticOnly,
    hasEnoughRecords,
    refresh,
    toggle,
  } = useRecommendations();

  const completedCount = recommendations.filter((r) => r.completada).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background?.val as string }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$4"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontFamily="$heading" fontSize={28} color="$color">
          Recomendaciones
        </Text>
        <TouchableOpacity
          onPress={refresh}
          disabled={loading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 8,
            backgroundColor: theme.backgroundHover?.val as string,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Ionicons name="refresh" size={18} color={theme.color?.val as string} />
          )}
          <Text fontFamily="$body" fontSize={14} color="$color">
            Actualizar
          </Text>
        </TouchableOpacity>
      </XStack>

      {/* Info banner when showing static/generic recommendations */}
      {recommendations.length > 0 && hasStaticOnly && (
        <View
          marginHorizontal="$4"
          marginBottom="$2"
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderRadius="$md"
          backgroundColor="$backgroundHover"
        >
          <Text fontFamily="$body" fontSize={13} color="$color" opacity={0.7}>
            {!hasEnoughRecords
              ? "Registra al menos 7 días de emociones para recibir recomendaciones personalizadas."
              : "Mostrando recomendaciones generales. Pulsa Actualizar para generar las tuyas."}
          </Text>
        </View>
      )}

      {/* Progress pill */}
      {recommendations.length > 0 && (
        <XStack
          marginHorizontal="$4"
          marginBottom="$2"
          alignItems="center"
          gap="$1"
        >
          <Ionicons name="trophy-outline" size={16} />
          <Text fontFamily="$body" fontSize={13} color="$color" opacity={0.6}>
            {completedCount}/{recommendations.length} completadas
          </Text>
        </XStack>
      )}

      {/* Error */}
      {error != null && (
        <View marginHorizontal="$4" marginBottom="$2">
          <Text fontFamily="$body" fontSize={13} color="$emotionAngry">
            {error}
          </Text>
        </View>
      )}

      {/* Loading state */}
      {loading && recommendations.length === 0 && (
        <View height={300} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" />
          <Text
            fontFamily="$body"
            fontSize={14}
            color="$color"
            opacity={0.6}
            marginTop="$4"
          >
            Generando tus recomendaciones…
          </Text>
        </View>
      )}

      {/* Cards */}
      <YStack paddingHorizontal="$4" gap="$4" paddingBottom="$4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            onToggle={() => toggle(rec.id)}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
