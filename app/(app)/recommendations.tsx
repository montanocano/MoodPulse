import { View, Text } from "tamagui";

export default function RecommendationsScreen() {
  return (
    <View
      flex={1}
      backgroundColor="$background"
      justifyContent="center"
      alignItems="center"
    >
      <Text fontFamily="$heading" fontSize={24} color="$color">
        Recomendaciones
      </Text>
      <Text color="$color" opacity={0.5} marginTop="$space.sm" fontSize={14}>
        Disponible en el Sprint 4
      </Text>
    </View>
  );
}
