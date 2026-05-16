import { useEffect, useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Input, Text, View, YStack, XStack, useTheme } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import { useSocialStore } from "../../../../features/social/store/socialStore";
import { FriendCard } from "../../components/FriendCard";
import { AppButton } from "../../components/AppButton";

export default function SocialScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const uid = user?.uid ?? "";

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResult,
    searchStatus,
    loading,
    error,
    loadFriends,
    loadRequests,
    searchByEmail,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
    clearSearch,
    clearError,
  } = useSocialStore();

  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    if (!uid) return;
    loadFriends(uid);
    loadRequests(uid);
  }, [uid, loadFriends, loadRequests]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }]);
    }
  }, [error, clearError]);

  function handleSearch() {
    if (!searchEmail.trim()) return;
    searchByEmail(searchEmail.trim(), uid);
  }

  function handleSendRequest() {
    if (!searchResult) return;
    sendRequest(uid, searchResult.uid, uid);
  }

  function handleCancelFromSearch() {
    if (!searchResult) return;
    const req = outgoingRequests.find((r) => r.toUid === searchResult.uid);
    if (req) cancelRequest(req.id, uid);
  }

  const isPendingTo = searchResult
    ? outgoingRequests.some((r) => r.toUid === searchResult.uid)
    : false;
  const isAlreadyFriend = searchResult
    ? friends.some((f) => f.uid === searchResult.uid)
    : false;

  return (
    <View flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background?.val as string }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <YStack gap="$space.lg">
          <Text fontFamily="$heading" fontSize={24} color="$color">
            Social
          </Text>

          {/* ── Search ──────────────────────────────────────────────── */}
          <YStack gap="$space.sm">
            <Text fontSize={14} color="$color" opacity={0.6} fontWeight="600">
              BUSCAR AMIGOS
            </Text>
            <XStack gap="$space.sm">
              <Input
                flex={1}
                value={searchEmail}
                onChangeText={(t) => {
                  setSearchEmail(t);
                  clearSearch();
                }}
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <AppButton
                label="Buscar"
                onPress={handleSearch}
                disabled={loading || !searchEmail.trim()}
                variant="primary"
              />
            </XStack>

            {searchStatus === "not_found" && (
              <Text color="$color" opacity={0.5} fontSize={14}>
                No se ha encontrado ningún usuario con ese correo.
              </Text>
            )}
            {searchStatus === "self" && (
              <Text color="$color" opacity={0.5} fontSize={14}>
                No puedes agregarte a ti mismo/a.
              </Text>
            )}
            {searchStatus === "found" && searchResult && (
              <XStack
                backgroundColor="$surface"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$space.md"
                alignItems="center"
                justifyContent="space-between"
              >
                <YStack>
                  <Text fontWeight="600" color="$color">
                    {searchResult.nombre ?? searchResult.email ?? searchResult.uid}
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>
                    {searchResult.email}
                  </Text>
                </YStack>
                <AppButton
                  label={
                    isAlreadyFriend
                      ? "Ya son amigos"
                      : isPendingTo
                        ? "Cancelar solicitud"
                        : "Enviar solicitud"
                  }
                  onPress={
                    isAlreadyFriend
                      ? undefined
                      : isPendingTo
                        ? handleCancelFromSearch
                        : handleSendRequest
                  }
                  disabled={isAlreadyFriend || loading}
                  variant={
                    isAlreadyFriend ? "neutral" : isPendingTo ? "danger" : "primary"
                  }
                />
              </XStack>
            )}
          </YStack>

          {/* ── Incoming requests ───────────────────────────────────── */}
          {incomingRequests.length > 0 && (
            <YStack gap="$space.sm">
              <Text fontSize={14} color="$color" opacity={0.6} fontWeight="600">
                SOLICITUDES RECIBIDAS ({incomingRequests.length})
              </Text>
              {incomingRequests.map((req) => (
                <XStack
                  key={req.id}
                  backgroundColor="$surface"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                  padding="$space.md"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontWeight="600" color="$color" flex={1}>
                    {req.fromName ?? req.fromUid}
                  </Text>
                  <XStack gap="$space.sm">
                    <AppButton
                      label="Aceptar"
                      onPress={() => acceptRequest(req.id, uid)}
                      disabled={loading}
                      variant="primary"
                    />
                    <AppButton
                      label="Rechazar"
                      onPress={() => rejectRequest(req.id, uid)}
                      disabled={loading}
                      variant="danger"
                    />
                  </XStack>
                </XStack>
              ))}
            </YStack>
          )}

          {/* ── Outgoing requests ───────────────────────────────────── */}
          {outgoingRequests.length > 0 && (
            <YStack gap="$space.sm">
              <Text fontSize={14} color="$color" opacity={0.6} fontWeight="600">
                SOLICITUDES ENVIADAS ({outgoingRequests.length})
              </Text>
              {outgoingRequests.map((req) => (
                <XStack
                  key={req.id}
                  backgroundColor="$surface"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                  padding="$space.md"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontWeight="600" color="$color" flex={1}>
                    {req.toName ?? req.toUid}
                  </Text>
                  <AppButton
                    label="Cancelar"
                    onPress={() => cancelRequest(req.id, uid)}
                    disabled={loading}
                    variant="danger"
                  />
                </XStack>
              ))}
            </YStack>
          )}

          {/* ── Friends list ─────────────────────────────────────────── */}
          <YStack gap="$space.sm">
            <Text fontSize={14} color="$color" opacity={0.6} fontWeight="600">
              AMIGOS
            </Text>
            {friends.length === 0 ? (
              <View
                backgroundColor="$surface"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$space.lg"
                alignItems="center"
              >
                <Text color="$color" opacity={0.5} textAlign="center" fontSize={14}>
                  Aún no tienes amigos en MoodPulse.{"\n"}¡Busca a alguien por su correo!
                </Text>
              </View>
            ) : (
              friends.map((f) => (
                <FriendCard
                  key={f.uid}
                  friend={f}
                  onRemove={() => removeFriend(uid, f.uid)}
                />
              ))
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
