import { View, Text } from "tamagui";

export default function HistoryScreen() {
  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
      <Text fontFamily="$heading" fontSize={24} color="$color">
        Historial
      </Text>
      <Text color="$color" opacity={0.5} marginTop="$space.sm" fontSize={14}>
        Disponible en el Sprint 3
      </Text>
    </View>
  );
}
