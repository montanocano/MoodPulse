import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { TamaguiProvider } from "tamagui";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/config/firebase";
import { useAuthStore } from "../src/stores/useAuthStore";
import tamaguiConfig, { fontAssets } from "../src/config/tamagui.config";

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

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
  }, [user, loading, segments]);

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
  }, []);

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
      <AuthGuard />
    </TamaguiProvider>
  );
}
