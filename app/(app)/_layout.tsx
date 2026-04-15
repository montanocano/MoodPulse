import { Tabs } from "expo-router";
import { useTheme } from "tamagui";

/**
 * Sprint 2 will add the real tabs (Registrar, Historial, Recomendaciones, Perfil).
 * For now this is a placeholder that renders a single Home tab.
 */
export default function AppLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background?.val as string,
          borderTopColor: theme.borderColor?.val as string,
        },
        tabBarActiveTintColor: theme.primary?.val as string,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
    </Tabs>
  );
}
