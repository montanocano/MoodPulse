import { Pressable } from "react-native";
import { Text, View, YStack } from "tamagui";
import { EmotionType, EMOTION_CONFIG } from "../../../types/emotion";

interface EmotionCardProps {
  emotion: EmotionType;
  selected: boolean;
  anySelected: boolean;
  onPress: (emotion: EmotionType) => void;
}

export default function EmotionCard({
  emotion,
  selected,
  anySelected,
  onPress,
}: EmotionCardProps) {
  const config = EMOTION_CONFIG[emotion];

  return (
    <Pressable
      onPress={() => onPress(emotion)}
      style={({ pressed }) => ({
        width: "46%",
        aspectRatio: 1,
        opacity: pressed ? 0.85 : anySelected && !selected ? 0.6 : 1,
        transform: [{ scale: selected ? 1.05 : 1 }],
      })}
    >
      <View
        flex={1}
        backgroundColor={config.colorValue + (selected ? "28" : "18")}
        borderWidth={selected ? 2 : 1}
        borderColor={selected ? config.colorValue : config.colorValue + "44"}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
        style={
          selected
            ? {
                shadowColor: config.colorValue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }
            : undefined
        }
      >
        <YStack alignItems="center" gap={6}>
          <Text fontSize={40}>{config.emoji}</Text>
          <Text
            fontSize={13}
            fontWeight={selected ? "700" : "500"}
            color={selected ? config.colorValue : "$color"}
            textAlign="center"
          >
            {config.label}
          </Text>
        </YStack>
      </View>
    </Pressable>
  );
}
