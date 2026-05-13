import { useCallback } from "react";
import { type User } from "firebase/auth";
import { useAuthStore } from "../store/authStore";

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

/**
 * useAuth — focused hook for auth feature consumers.
 *
 * Selects only the state slices this hook exposes and wraps every action in
 * useCallback so callers get stable function references across re-renders.
 */
export function useAuth(): UseAuthReturn {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const _signIn = useAuthStore((s) => s.signIn);
  const _signOut = useAuthStore((s) => s.signOut);
  const _register = useAuthStore((s) => s.register);
  const _sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);
  const _clearError = useAuthStore((s) => s.clearError);

  const signIn = useCallback(_signIn, [_signIn]);
  const signOut = useCallback(_signOut, [_signOut]);
  const register = useCallback(_register, [_register]);
  const sendPasswordReset = useCallback(_sendPasswordReset, [
    _sendPasswordReset,
  ]);
  const clearError = useCallback(_clearError, [_clearError]);

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    register,
    sendPasswordReset,
    clearError,
  };
}
