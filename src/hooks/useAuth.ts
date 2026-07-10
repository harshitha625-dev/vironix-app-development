import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  return { status, user, isSignedIn: status === 'signedIn', signOut };
}
