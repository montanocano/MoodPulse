import { TouchableOpacity } from "react-native";
import { View, Text, XStack, YStack, ScrollView as TScrollView } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHistory } from "../../../../features/history/hooks/useHistory";
import { CalendarDay } from "../../components/CalendarDay";
import { WeeklyTrendChart } from "../../components/WeeklyTrendChart";
import { EmotionDistributionBar } from "../../components/EmotionDistributionBar";
import { EMOTION_CONFIG } from "../../../../types/emotion";
import { dayLabels, todayISO } from "../../../utils/calendarHelpers";
import { formatShortDate } from "../../../utils/formatters";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const {
    year,
    monthName,
    grid,
    recordsByDate,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    selectedDate,
    selectDate,
    clearSelection,
    showStats,
    setShowStats,
    dominant,
    streak,
    trend,
    distribution,
    hasEnoughRecords,
  } = useHistory();

  const today = todayISO();

  const monthHasRecords = grid
    .flat()
    .some((d) => d !== null && recordsByDate[d] !== undefined);

  const selectedRecord = selectedDate ? recordsByDate[selectedDate] : null;

  return (
    <View flex={1} backgroundColor="$background" paddingTop={insets.top}>
      {/* ── CALENDAR VIEW ──────────────────────────────────────────────────── */}
      {!showStats && (
        <YStack flex={1}>
          {/* Month navigation header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$space.md"
            paddingVertical="$space.md"
          >
            <TouchableOpacity onPress={goToPrevMonth}>
              <Text
                fontSize={22}
                color="$primary"
                paddingHorizontal="$space.sm"
              >
                ‹
              </Text>
            </TouchableOpacity>

            <Text fontFamily="$heading" fontSize={16} color="$color">
              {monthName} {year}
            </Text>

            <XStack alignItems="center" gap="$space.md">
              <TouchableOpacity
                onPress={goToNextMonth}
                disabled={isCurrentMonth}
              >
                <Text
                  fontSize={22}
                  color="$primary"
                  opacity={isCurrentMonth ? 0.3 : 1}
                  paddingHorizontal="$space.sm"
                >
                  ›
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowStats(true)}>
                <Text fontSize={13} color="$primary" fontWeight="600">
                  Estadísticas
                </Text>
              </TouchableOpacity>
            </XStack>
          </XStack>

          {/* Day-of-week header */}
          <XStack
            justifyContent="space-around"
            paddingHorizontal="$space.md"
            marginBottom="$space.xs"
          >
            {dayLabels.map((label) => (
              <View key={label} width={28} alignItems="center">
                <Text
                  fontSize={11}
                  color="$color"
                  opacity={0.5}
                  fontWeight="600"
                >
                  {label}
                </Text>
              </View>
            ))}
          </XStack>

          {/* Calendar grid */}
          <YStack paddingHorizontal="$space.md" gap="$space.xs">
            {grid.map((week, rowIdx) => (
              <XStack key={rowIdx} justifyContent="space-around">
                {week.map((date, colIdx) => (
                  <CalendarDay
                    key={`${rowIdx}-${colIdx}`}
                    date={date}
                    record={date ? recordsByDate[date] : undefined}
                    isToday={date === today}
                    onPress={selectDate}
                  />
                ))}
              </XStack>
            ))}
          </YStack>

          {/* Empty state */}
          {!monthHasRecords && (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingHorizontal="$space.xl"
            >
              <Text fontSize={32} marginBottom="$space.md">
                📅
              </Text>
              <Text
                fontFamily="$heading"
                fontSize={16}
                color="$color"
                textAlign="center"
                opacity={0.7}
              >
                Aún no tienes registros este mes.
              </Text>
              <Text
                fontSize={14}
                color="$color"
                textAlign="center"
                opacity={0.5}
                marginTop="$space.xs"
              >
                ¡Empieza a registrar tus emociones!
              </Text>
            </YStack>
          )}
        </YStack>
      )}

      {/* ── STATISTICS VIEW ────────────────────────────────────────────────── */}
      {showStats && (
        <TScrollView flex={1} showsVerticalScrollIndicator={false}>
          {/* Stats header */}
          <XStack
            alignItems="center"
            paddingHorizontal="$space.md"
            paddingVertical="$space.md"
            gap="$space.md"
          >
            <TouchableOpacity onPress={() => setShowStats(false)}>
              <Text fontSize={13} color="$primary" fontWeight="600">
                ← Historial
              </Text>
            </TouchableOpacity>
            <Text
              fontFamily="$heading"
              fontSize={16}
              color="$color"
              flex={1}
              textAlign="center"
            >
              Estadísticas
            </Text>
            <View width={60} />
          </XStack>

          {!hasEnoughRecords ? (
            <YStack
              flex={1}
              alignItems="center"
              paddingTop="$space.xxl"
              paddingHorizontal="$space.xl"
            >
              <Text fontSize={40} marginBottom="$space.md">
                📊
              </Text>
              <Text
                fontFamily="$heading"
                fontSize={16}
                color="$color"
                textAlign="center"
                opacity={0.7}
              >
                Registra al menos 3 días para ver tus estadísticas
              </Text>
            </YStack>
          ) : (
            <YStack
              paddingHorizontal="$space.md"
              gap="$space.lg"
              paddingBottom="$space.xxl"
            >
              {/* Dominant emotion + streak card */}
              {dominant && (
                <View
                  backgroundColor="$surface"
                  borderRadius="$lg"
                  padding="$space.md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$space.sm">
                      <Text fontSize={32}>
                        {EMOTION_CONFIG[dominant].emoji}
                      </Text>
                      <YStack>
                        <Text fontSize={11} color="$color" opacity={0.5}>
                          Emoción predominante
                        </Text>
                        <Text
                          fontFamily="$heading"
                          fontSize={18}
                          color="$color"
                        >
                          {EMOTION_CONFIG[dominant].label}
                        </Text>
                      </YStack>
                    </XStack>
                    <YStack alignItems="flex-end">
                      <Text
                        fontFamily="$heading"
                        fontSize={24}
                        color="$primary"
                      >
                        {streak}
                      </Text>
                      <Text fontSize={11} color="$color" opacity={0.5}>
                        días de racha
                      </Text>
                    </YStack>
                  </XStack>
                </View>
              )}

              {/* Weekly trend chart */}
              <YStack gap="$space.sm">
                <Text
                  fontFamily="$heading"
                  fontSize={14}
                  color="$color"
                  opacity={0.7}
                >
                  Tendencia semanal
                </Text>
                <View
                  backgroundColor="$surface"
                  borderRadius="$lg"
                  padding="$space.md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <WeeklyTrendChart entries={trend} />
                </View>
              </YStack>

              {/* Emotion distribution */}
              {distribution.length > 0 && (
                <YStack gap="$space.sm">
                  <Text
                    fontFamily="$heading"
                    fontSize={14}
                    color="$color"
                    opacity={0.7}
                  >
                    Distribución de emociones
                  </Text>
                  <View
                    backgroundColor="$surface"
                    borderRadius="$lg"
                    padding="$space.md"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    {distribution.map((entry) => (
                      <EmotionDistributionBar
                        key={entry.emotion}
                        entry={entry}
                      />
                    ))}
                  </View>
                </YStack>
              )}
            </YStack>
          )}
        </TScrollView>
      )}

      {/* ── DAY DETAIL SHEET ──────────────────────────────────────────────── */}
      {selectedDate !== null && (
        <View
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="$surface"
          borderTopLeftRadius="$xl"
          borderTopRightRadius="$xl"
          borderTopWidth={1}
          borderColor="$borderColor"
          paddingTop="$space.md"
          paddingBottom={insets.bottom + 16}
          paddingHorizontal="$space.lg"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: -4 } as never}
          shadowOpacity={0.15}
          shadowRadius={12}
        >
          {/* Sheet handle */}
          <View
            width={40}
            height={4}
            backgroundColor="$borderColor"
            borderRadius="$full"
            alignSelf="center"
            marginBottom="$space.md"
          />

          {/* Close button */}
          <TouchableOpacity
            onPress={clearSelection}
            style={{ position: "absolute", top: 16, right: 20, padding: 8 }}
          >
            <Text fontSize={18} color="$color" opacity={0.5}>
              ✕
            </Text>
          </TouchableOpacity>

          {/* Date label */}
          <Text
            fontSize={13}
            color="$color"
            opacity={0.5}
            marginBottom="$space.sm"
          >
            {formatShortDate(selectedDate)}
          </Text>

          {selectedRecord ? (
            <YStack gap="$space.sm">
              <XStack alignItems="center" gap="$space.sm">
                <Text fontSize={28}>
                  {EMOTION_CONFIG[selectedRecord.emotion].emoji}
                </Text>
                <YStack>
                  <Text fontFamily="$heading" fontSize={18} color="$color">
                    {EMOTION_CONFIG[selectedRecord.emotion].label}
                  </Text>
                  <Text fontSize={13} color="$color" opacity={0.6}>
                    Intensidad: {selectedRecord.intensity}/10
                  </Text>
                </YStack>
              </XStack>

              {selectedRecord.reflection ? (
                <Text
                  fontSize={14}
                  color="$color"
                  opacity={0.8}
                  lineHeight={22}
                  marginTop="$space.xs"
                >
                  {selectedRecord.reflection}
                </Text>
              ) : (
                <Text
                  fontSize={14}
                  color="$color"
                  opacity={0.4}
                  fontStyle="italic"
                >
                  Sin reflexión escrita
                </Text>
              )}
            </YStack>
          ) : (
            <Text color="$color" opacity={0.5} fontSize={14}>
              No hay registro para este día
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
