/**
 * Thin wrapper so screens never import an analytics SDK directly.
 * Wire this up to @react-native-firebase/analytics + crashlytics once you've
 * run the Firebase setup (google-services.json / GoogleService-Info.plist).
 * Until then it logs to the console so event flow can still be verified.
 */
type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_complete'
  | 'sign_up'
  | 'sign_in'
  | 'generation_started'
  | 'generation_completed'
  | 'generation_failed'
  | 'credits_recharged'
  | 'plan_upgraded'
  | 'export_completed'
  | 'share_completed';

export const analytics = {
  logEvent(name: AnalyticsEvent, params?: Record<string, unknown>) {
    if (__DEV__) console.log('[analytics]', name, params ?? {});
    // firebaseAnalytics().logEvent(name, params);
  },
  setUser(userId: string | null) {
    if (__DEV__) console.log('[analytics] setUser', userId);
    // firebaseAnalytics().setUserId(userId);
  },
  recordError(error: unknown, context?: string) {
    if (__DEV__) console.warn('[crashlytics]', context, error);
    // crashlytics().recordError(error as Error);
  },
};
