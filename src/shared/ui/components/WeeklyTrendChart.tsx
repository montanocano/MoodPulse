import { View, Text, XStack, YStack } from "tamagui";
import { WeeklyTrendEntry } from "../../utils/statsCalculator";
import { EMOTION_CONFIG } from "../../../types/emotion";
import { dayLabels } from "../../utils/calendarHelpers";
import { tokens } from "../tokens";

interface WeeklyTrendChartProps {
  entries: WeeklyTrendEntry[];
}

const MAX_BAR_HEIGHT = 72;
const BAR_WIDTH = 28;
const EMPTY_COLOR = tokens.color.muted.val;

export function WeeklyTrendChart({ entries }: WeeklyTrendChartProps) {
  return (
    <XStack
      justifyContent="space-between"
      alignItems="flex-end"
      paddingHorizontal="$space.xs"
    >
      {entries.map((entry, index) => {
        const barHeight =
          entry.intensity != null
            ? Math.max(4, Math.round((entry.intensity / 10) * MAX_BAR_HEIGHT))
            : 4;

        const barColor =
          entry.emotion != null
            ? EMOTION_CONFIG[entry.emotion].colorValue
            : EMPTY_COLOR;

        // 0 = Monday … 6 = Sunday based on dayLabels
        const dayOfWeek = new Date(
          Number(entry.date.slice(0, 4)),
          Number(entry.date.slice(5, 7)) - 1,
          Number(entry.date.slice(8, 10)),
        ).getDay(); // 0=Sun … 6=Sat
        // Convert to Mon-first: (day + 6) % 7 → 0=Mon … 6=Sun
        const labelIndex = (dayOfWeek + 6) % 7;
        const label = dayLabels[labelIndex];

        return (
          <YStack
            key={entry.date}
            alignItems="center"
            justifyContent="flex-end"
            width={BAR_WIDTH}
            gap="$space.xs"
          >
            <View
              width={BAR_WIDTH - 4}
              height={barHeight}
              borderRadius="$sm"
              backgroundColor={barColor}
            />
            <Text fontSize={10} color="$color" opacity={0.6}>
              {label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
