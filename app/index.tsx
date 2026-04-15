import { Redirect } from "expo-router";

// The auth guard in _layout.tsx handles the actual redirect logic.
// This file satisfies Expo Router's requirement for a root index route.
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
