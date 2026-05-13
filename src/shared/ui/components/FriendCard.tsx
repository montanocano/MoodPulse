import { Image } from "expo-image";
import { Text, View, XStack, YStack } from "tamagui";
import type { FriendSummary } from "../../../features/social/types";

interface Props {
  friend: FriendSummary;
}

export function FriendCard({ friend }: Props) {
  const initials = friend.nombre.slice(0, 2).toUpperCase();
  const visibleAchievements = friend.achievements.slice(0, 4);
  const extra = friend.achievements.length - 4;

  return (
    <XStack
      backgroundColor="$surface"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      padding="$space.md"
      gap="$space.md"
      alignItems="center"
    >
      {/* Avatar */}
      <View
        width={48}
        height={48}
        borderRadius={24}
        backgroundColor="$primary"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {friend.fotoUrl ? (
          <Image
            source={{ uri: friend.fotoUrl }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
        ) : (
          <Text color="$white" fontWeight="700" fontSize={18}>
            {initials}
          </Text>
        )}
      </View>

      {/* Info */}
      <YStack flex={1} gap="$space.xs">
        <Text fontWeight="600" fontSize={15} color="$color">
          {friend.nombre}
        </Text>
        <Text fontSize={13} color="$color" opacity={0.6}>
          {friend.streak} días de racha 🔥
        </Text>
        {visibleAchievements.length > 0 && (
          <XStack gap="$space.xs" flexWrap="wrap">
            {visibleAchievements.map((a) => (
              <Text key={a.type} fontSize={18}>
                {a.emoji}
              </Text>
            ))}
            {extra > 0 && (
              <Text
                fontSize={12}
                color="$color"
                opacity={0.5}
                alignSelf="center"
              >
                +{extra} más
              </Text>
            )}
          </XStack>
        )}
      </YStack>
    </XStack>
  );
}
