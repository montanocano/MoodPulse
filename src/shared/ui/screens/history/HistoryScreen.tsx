import { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { View, Text, XStack, YStack, ScrollView as TScrollView } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useHistory } from "../../../../features/history/hooks/useHistory";
import { useEmotionStore } from "../../../../features/emotion/store/emotionStore";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import { CalendarDay } from "../../components/CalendarDay";
import { WeeklyTrendChart } from "../../components/WeeklyTrendChart";
import { EmotionDistributionBar } from "../../components/EmotionDistributionBar";
import { EMOTION_CONFIG } from "../../../../types/emotion";
import { dayLabels, todayISO } from "../../../utils/calendarHelpers";
import { formatShortDate } from "../../../utils/formatters";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const loadRecords = useEmotionStore((s) => s.loadRecords);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) loadRecords(user.uid);
    }, [user?.uid, loadRecords]),
  );
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

  const allRecords = useEmotionStore((s) => s.records);
  const today = todayISO();

  const monthHasRecords = grid
    .flat()
    .some((d) => d !== null && recordsByDate[d] !== undefined);

  const monthRecords = Object.values(recordsByDate);
  const monthAvgIntensity =
    monthRecords.length > 0
      ? Math.round(
          (monthRecords.reduce((s, r) => s + r.intensity, 0) /
            monthRecords.length) *
            10,
        ) / 10
      : 0;
  const recentMonthRecords = [...monthRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const globalAvgIntensity =
    allRecords.length > 0
      ? Math.round(
          (allRecords.reduce((s, r) => s + r.intensity, 0) /
            allRecords.length) *
            10,
        ) / 10
      : 0;

  const maxIntensity =
    allRecords.length > 0
      ? Math.max(...allRecords.map((r) => r.intensity))
      : 0;

  const minIntensity =
    allRecords.length > 0
      ? Math.min(...allRecords.map((r) => r.intensity))
      : 0;

  const reflectionsCount = allRecords.filter(
    (r) => r.reflection && r.reflection.trim().length > 0,
  ).length;

  const bestStreakEver = (() => {
    if (allRecords.length === 0) return 0;
    const dates = [...new Set(allRecords.map((r) => r.date))].sort();
    let best = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i++) {
      const [y1, m1, d1] = dates[i - 1].split("-").map(Number);
      const [y2, m2, d2] = dates[i].split("-").map(Number);
      const diff =
        (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000;
      if (diff === 1) {
        current++;
        if (current > best) best = current;
      } else {
        current = 1;
      }
    }
    return best;
  })();

  const recentAllRecords = [...allRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const selectedRecord = selectedDate ? recordsByDate[selectedDate] : null;

  return (
    <View flex={1} backgroundColor="$background" paddingTop={insets.top}>
      {/* ── CALENDAR VIEW ──────────────────────────────────────────────────── */}
      {!showStats && (
        <TScrollView flex={1} showsVerticalScrollIndicator={false}>
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

          {/* Monthly summary — shown when the month has records */}
          {monthHasRecords && (
            <YStack
              paddingHorizontal="$space.md"
              paddingTop="$space.lg"
              paddingBottom="$space.xxl"
              gap="$space.md"
            >
              <Text
                fontFamily="$heading"
                fontSize={14}
                color="$color"
                opacity={0.7}
              >
                Resumen del mes
              </Text>

              {/* Stat cards row */}
              <XStack gap="$space.md">
                <View
                  flex={1}
                  backgroundColor="$surface"
                  borderRadius="$lg"
                  padding="$space.md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text fontFamily="$heading" fontSize={28} color="$primary">
                    {monthRecords.length}
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>
                    días registrados
                  </Text>
                </View>

                <View
                  flex={1}
                  backgroundColor="$surface"
                  borderRadius="$lg"
                  padding="$space.md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text fontFamily="$heading" fontSize={28} color="$primary">
                    {monthAvgIntensity}
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>
                    intensidad media
                  </Text>
                </View>

                <View
                  flex={1}
                  backgroundColor="$surface"
                  borderRadius="$lg"
                  padding="$space.md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text fontFamily="$heading" fontSize={28} color="$primary">
                    {streak}
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>
                    racha actual
                  </Text>
                </View>
              </XStack>

              {/* Recent entries */}
              <Text
                fontFamily="$heading"
                fontSize={14}
                color="$color"
                opacity={0.7}
                marginTop="$space.xs"
              >
                Últimos registros
              </Text>
              <YStack gap="$space.sm">
                {recentMonthRecords.map((record) => {
                  const cfg = EMOTION_CONFIG[record.emotion];
                  return (
                    <TouchableOpacity
                      key={record.date}
                      onPress={() => selectDate(record.date)}
                    >
                      <XStack
                        backgroundColor="$surface"
                        borderRadius="$lg"
                        borderWidth={1}
                        borderColor="$borderColor"
                        padding="$space.md"
                        alignItems="center"
                        gap="$space.md"
                      >
                        <View
                          width={40}
                          height={40}
                          borderRadius={20}
                          backgroundColor={cfg.colorValue}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize={20}>{cfg.emoji}</Text>
                        </View>
                        <YStack flex={1}>
                          <Text
                            fontFamily="$heading"
                            fontSize={15}
                            color="$color"
                          >
                            {cfg.label}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.5}>
                            {formatShortDate(record.date)} · intensidad{" "}
                            {record.intensity}/10
                          </Text>
                        </YStack>
                        {record.reflection ? (
                          <Text fontSize={12} color="$color" opacity={0.4}>
                            💬
                          </Text>
                        ) : null}
                      </XStack>
                    </TouchableOpacity>
                  );
                })}
              </YStack>
            </YStack>
          )}

          {/* Empty state */}
          {!monthHasRecords && (
            <YStack
              alignItems="center"
              justifyContent="center"
              paddingHorizontal="$space.xl"
              paddingTop="$space.xxl"
              paddingBottom="$space.xxl"
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
        </TScrollView>
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

              {/* Global summary */}
              <YStack gap="$space.sm">
                <Text
                  fontFamily="$heading"
                  fontSize={14}
                  color="$color"
                  opacity={0.7}
                >
                  Resumen global
                </Text>
                <XStack gap="$space.md">
                  <View
                    flex={1}
                    backgroundColor="$surface"
                    borderRadius="$lg"
                    padding="$space.md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    alignItems="center"
                  >
                    <Text fontFamily="$heading" fontSize={32} color="$primary">
                      {allRecords.length}
                    </Text>
                    <Text
                      fontSize={12}
                      color="$color"
                      opacity={0.5}
                      textAlign="center"
                    >
                      registros totales
                    </Text>
                  </View>
                  <View
                    flex={1}
                    backgroundColor="$surface"
                    borderRadius="$lg"
                    padding="$space.md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    alignItems="center"
                  >
                    <Text fontFamily="$heading" fontSize={32} color="$primary">
                      {globalAvgIntensity}
                    </Text>
                    <Text
                      fontSize={12}
                      color="$color"
                      opacity={0.5}
                      textAlign="center"
                    >
                      intensidad media
                    </Text>
                  </View>
                </XStack>
              </YStack>

              {/* Detail stats grid */}
              <YStack gap="$space.sm">
                <Text
                  fontFamily="$heading"
                  fontSize={14}
                  color="$color"
                  opacity={0.7}
                >
                  Tus números
                </Text>
                <XStack gap="$space.md" flexWrap="wrap">
                  <View
                    flex={1}
                    minWidth="40%"
                    backgroundColor="$surface"
                    borderRadius="$lg"
                    padding="$space.md"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontFamily="$heading" fontSize={22} color="$primary">
                      {maxIntensity}/10
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.5}>
                      intensidad máxima
                    </Text>
                  </View>
                  <View
                    flex={1}
                    minWidth="40%"
                    backgroundColor="$surface"
                    borderRadius="$lg"
                    padding="$space.md"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontFamily="$heading" fontSize={22} color="$primary">
                      {minIntensity}/10
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.5}>
                      intensidad mínima
                    </Text>
                  </View>
                  <View
                    flex={1}
                    minWidth="40%"
                    backgroundColor="$surface"
                    borderRadius="$lg"
                    padding="$space.md"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontFamily="$heading" fontSize={22} color="$primary">
                      {reflectionsCount}
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.5}>
                      reflexiones escritas
                    </Text>
                  </View>
                  <View
                    flex={1}
                    minWidth="40%"
                    backgroundColor="$surface"
                    borderRadius="$lg"
                    padding="$space.md"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontFamily="$heading" fontSize={22} color="$primary">
                      {bestStreakEver}
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.5}>
                      mejor racha
                    </Text>
                  </View>
                </XStack>
              </YStack>

              {/* Recent activity */}
              {recentAllRecords.length > 0 && (
                <YStack gap="$space.sm">
                  <Text
                    fontFamily="$heading"
                    fontSize={14}
                    color="$color"
                    opacity={0.7}
                  >
                    Actividad reciente
                  </Text>
                  <YStack gap="$space.sm">
                    {recentAllRecords.map((record) => {
                      const cfg = EMOTION_CONFIG[record.emotion];
                      return (
                        <XStack
                          key={record.date}
                          backgroundColor="$surface"
                          borderRadius="$lg"
                          borderWidth={1}
                          borderColor="$borderColor"
                          padding="$space.md"
                          alignItems="center"
                          gap="$space.md"
                        >
                          <View
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor={cfg.colorValue}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize={20}>{cfg.emoji}</Text>
                          </View>
                          <YStack flex={1}>
                            <Text
                              fontFamily="$heading"
                              fontSize={15}
                              color="$color"
                            >
                              {cfg.label}
                            </Text>
                            <Text fontSize={12} color="$color" opacity={0.5}>
                              {formatShortDate(record.date)} · intensidad{" "}
                              {record.intensity}/10
                            </Text>
                          </YStack>
                          {record.reflection ? (
                            <Text fontSize={12} color="$color" opacity={0.4}>
                              💬
                            </Text>
                          ) : null}
                        </XStack>
                      );
                    })}
                  </YStack>
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
