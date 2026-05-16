import { useEffect } from "react";
import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/features/auth/store/authStore";
import { useEmotionStore } from "../../src/features/emotion/store/emotionStore";
import { useRecommendationStore } from "../../src/features/recommendations/store/recommendationStore";
import { registerAndGetPushToken } from "../../src/shared/utils/notificationHelper";
import { savePushToken } from "../../src/features/social/repositories/DefaultSocialRepository";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(active: IoniconsName, inactive: IoniconsName) {
  const Icon = ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );
  Icon.displayName = "TabBarIcon";
  return Icon;
}

export default function AppLayout() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const loadRecords = useEmotionStore((s) => s.loadRecords);
  const loadRecommendations = useRecommendationStore((s) => s.loadRecommendations);

  useEffect(() => {
    if (user?.uid) {
      loadRecords(user.uid);
      loadRecommendations(user.uid);
    }
  }, [user?.uid, loadRecords, loadRecommendations]);

  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid;
    registerAndGetPushToken().then((token) => {
      if (token) savePushToken(uid, token).catch(() => {});
    });
  }, [user?.uid]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background?.val as string,
          borderTopColor: theme.borderColor?.val as string,
        },
        tabBarActiveTintColor: theme.primary?.val as string,
        tabBarInactiveTintColor:
          (theme.placeholderColor?.val as string) ?? "#999",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Registrar",
          tabBarIcon: tabIcon("pencil", "pencil-outline"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarIcon: tabIcon("calendar", "calendar-outline"),
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: "Recomendaciones",
          tabBarIcon: tabIcon("bulb", "bulb-outline"),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: tabIcon("people", "people-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: tabIcon("person", "person-outline"),
        }}
      />
      {/* reflection and delete-account are stack routes, not tabs — hide from tab bar */}
      <Tabs.Screen name="reflection" options={{ href: null }} />
      <Tabs.Screen name="delete-account" options={{ href: null }} />
    </Tabs>
  );
}
