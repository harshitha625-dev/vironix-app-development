import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { supabase, isSupabaseConfigured } from './supabase';

const isExpoGoAndroid =
  Platform.OS === 'android' &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: any = null;
if (!isExpoGoAndroid) {
  try {
    // Using require instead of top-level import to prevent crash at startup in Expo Go
    Notifications = require('expo-notifications');
  } catch (error) {
    console.warn('Failed to load expo-notifications:', error);
  }
}

if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Failed to set expo-notifications handler:', error);
  }
}

/** Requests permission, grabs an Expo push token, and stores it against the
 * signed-in user so server-side FCM/APNs sends can target this device. */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Notifications) {
    console.warn('Skipping push notifications registration: expo-notifications is not available.');
    return null;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? '00000000-0000-0000-0000-000000000000';
    
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    if (isSupabaseConfigured) {
      await supabase.from('devices').upsert({ user_id: userId, push_token: token, platform: Platform.OS });
    }
    return token;
  } catch (error) {
    console.warn('Push notification token generation failed:', error);
    return null;
  }
}

export function addNotificationResponseListener(cb: (data: Record<string, unknown>) => void) {
  if (!Notifications) {
    return () => {};
  }
  try {
    const sub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      cb((response.notification.request.content.data ?? {}) as Record<string, unknown>);
    });
    return () => sub.remove();
  } catch (error) {
    console.warn('Failed to add notification response listener:', error);
    return () => {};
  }
}
