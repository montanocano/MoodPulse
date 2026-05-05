import { View, Text, XStack, YStack } from "tamagui";
import { Pressable, useWindowDimensions } from "react-native";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  accentColor?: string;
}

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function IntensitySlider({
  value,
  onChange,
  accentColor = "#6C5CE7",
}: IntensitySliderProps) {
  const { width } = useWindowDimensions();
  // 32px de padding horizontal total, 4px de gap entre 10 ítems = 36px extra
  const itemSize = Math.floor((width - 32 - 36) / 10);

  return (
    <YStack gap={12}>
      {/* Etiquetas + valor actual */}
      <XStack justifyContent="space-between" alignItems="center">
        <Text color="$color" opacity={0.45} fontSize={12}>
          😌 Baja
        </Text>
        <View
          backgroundColor={accentColor + "22"}
          borderRadius={9999}
          paddingHorizontal={14}
          paddingVertical={4}
          borderWidth={1.5}
          borderColor={accentColor}
        >
          <Text fontSize={17} fontWeight="700" color={accentColor}>
            {value}/10
          </Text>
        </View>
        <Text color="$color" opacity={0.45} fontSize={12}>
          Alta 🔥
        </Text>
      </XStack>

      {/* Círculos numéricos */}
      <XStack justifyContent="space-between">
        {STEPS.map((step) => {
          const isSelected = step === value;
          const isFilled = step <= value;
          return (
            <Pressable key={step} onPress={() => onChange(step)} hitSlop={6}>
              <View
                width={itemSize}
                height={itemSize}
                borderRadius={itemSize / 2}
                backgroundColor={isFilled ? accentColor : accentColor + "18"}
                borderWidth={isSelected ? 2.5 : 1}
                borderColor={accentColor}
                alignItems="center"
                justifyContent="center"
                style={
                  isSelected ? { transform: [{ scale: 1.18 }] } : undefined
                }
              >
                <Text
                  fontSize={itemSize < 30 ? 11 : 13}
                  fontWeight={isSelected ? "800" : "500"}
                  color={isFilled ? "white" : accentColor}
                >
                  {step}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
}
