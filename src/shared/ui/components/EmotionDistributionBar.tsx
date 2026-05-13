import { View, Text, XStack } from "tamagui";
import { DistributionEntry } from "../../utils/statsCalculator";
import { EMOTION_CONFIG } from "../../../types/emotion";

interface EmotionDistributionBarProps {
  entry: DistributionEntry;
}

export function EmotionDistributionBar({ entry }: EmotionDistributionBarProps) {
  const { emoji, label, colorValue } = EMOTION_CONFIG[entry.emotion];

  return (
    <XStack alignItems="center" gap="$space.sm" marginBottom="$space.xs">
      {/* Emotion label — fixed width */}
      <XStack width={110} alignItems="center" gap="$space.xs">
        <Text fontSize={14}>{emoji}</Text>
        <Text fontSize={12} color="$color" numberOfLines={1} flexShrink={1}>
          {label}
        </Text>
      </XStack>

      {/* Progress bar — flexible */}
      <View
        flex={1}
        height={10}
        backgroundColor="$muted"
        borderRadius="$full"
        overflow="hidden"
      >
        <View
          width={`${entry.percentage}%`}
          height={10}
          backgroundColor={colorValue}
          borderRadius="$full"
        />
      </View>

      {/* Percentage text — fixed width */}
      <Text
        fontSize={12}
        color="$color"
        opacity={0.7}
        width={36}
        textAlign="right"
      >
        {entry.percentage}%
      </Text>
    </XStack>
  );
}
