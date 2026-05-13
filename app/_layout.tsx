import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { TamaguiProvider } from "tamagui";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../src/shared/api/firebase";
import { useAuthStore } from "../src/features/auth/store/authStore";
import { useSettingsStore } from "../src/features/settings/store/settingsStore";
import { useSocialStore } from "../src/features/social/store/socialStore";
import tamaguiConfig, {
  fontAssets,
} from "../src/shared/ui/theme/tamagui.config";

SplashScreen.preventAutoHideAsync();

function AuthGuard({ authReady }: { authReady: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // No navegar hasta que Firebase haya resuelto el estado de sesión
    if (!authReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";
    const onVerifyScreen = (segments as string[]).includes("verify-email");

    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (!user.emailVerified) {
      if (!onVerifyScreen) {
        router.replace("/(auth)/verify-email");
      }
    } else {
      if (!inAppGroup) {
        router.replace("/(app)");
      }
    }
  }, [user, authReady, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const setUser = useAuthStore((s) => s.setUser);
  const resetSocial = useSocialStore((s) => s.reset);
  const theme = useSettingsStore((s) => s.theme);
  const [authReady, setAuthReady] = useState(false);
  const [fontsLoaded] = useFonts(fontAssets);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      if (!firebaseUser) resetSocial();
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, [setUser, resetSocial]);

  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <AuthGuard authReady={authReady} />
    </TamaguiProvider>
  );
}
