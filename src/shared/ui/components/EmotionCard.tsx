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
        width: "23%",
        aspectRatio: 0.85,
        opacity: pressed ? 0.8 : anySelected && !selected ? 0.55 : 1,
        transform: [{ scale: selected ? 1.06 : 1 }],
      })}
    >
      <View
        flex={1}
        backgroundColor={config.colorValue}
        borderRadius={14}
        alignItems="center"
        justifyContent="center"
        style={
          selected
            ? {
                shadowColor: config.colorValue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 8,
                elevation: 8,
              }
            : {
                shadowColor: "$black",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }
        }
      >
        <YStack alignItems="center" gap={4} paddingVertical={10}>
          <Text fontSize={28}>{config.emoji}</Text>
          <Text
            fontSize={11}
            fontWeight="600"
            color="$white"
            textAlign="center"
            numberOfLines={1}
          >
            {config.label}
          </Text>
        </YStack>
      </View>
    </Pressable>
  );
}
