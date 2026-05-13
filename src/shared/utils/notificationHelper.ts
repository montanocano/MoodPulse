import Constants from "expo-constants";

// expo-notifications remote push support was removed from Expo Go in SDK 53.
// Using dynamic imports so the module (and its side-effectful
// DevicePushTokenAutoRegistration.fx.js) is never evaluated in Expo Go.
const isExpoGo = Constants.executionEnvironment === "storeClient";

let handlerSet = false;
async function getNotifications() {
  const Notifications = await import("expo-notifications");
  if (!handlerSet) {
    handlerSet = true;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
  return Notifications;
}

export async function requestPermissions(): Promise<boolean> {
  if (isExpoGo) return false;
  const Notifications = await getNotifications();
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDaily(
  hour: number,
  minute: number,
): Promise<void> {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "MoodPulse",
      body: "¡Es hora de registrar tu estado de ánimo!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAll(): Promise<void> {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function registerAndGetPushToken(): Promise<string | null> {
  if (isExpoGo) return null;
  try {
    const Notifications = await getNotifications();
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return null;

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token;
  } catch {
    return null;
  }
}
