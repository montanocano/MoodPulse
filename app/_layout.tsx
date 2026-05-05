import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { TamaguiProvider } from "tamagui";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/shared/api/firebase";
import { useAuthStore } from "../src/features/auth/store/authStore";
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
  const [authReady, setAuthReady] = useState(false);
  const [fontsLoaded] = useFonts(fontAssets);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <AuthGuard authReady={authReady} />
    </TamaguiProvider>
  );
}
