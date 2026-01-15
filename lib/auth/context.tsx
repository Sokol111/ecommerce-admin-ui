'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getProfileAction, loginAction, refreshTokenAction } from './actions';
import { clearTokens, getTokens, isTokenExpired, saveTokens } from './storage';
import { AuthContextType, AuthState, AuthTokens } from './types';

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = ['/login'];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const tokens = getTokens();
    if (!tokens?.refreshToken) {
      return false;
    }

    try {
      const result = await refreshTokenAction(tokens.refreshToken);
      if (!result.success || !result.data) {
        clearTokens();
        setState({
          user: null,
          tokens: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return false;
      }

      const newTokens: AuthTokens = {
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresAt: Date.now() + result.data.expiresIn * 1000,
      };

      saveTokens(newTokens);

      // Get updated profile
      const profileResult = await getProfileAction(newTokens.accessToken);
      if (profileResult.success && profileResult.data) {
        setState({
          user: profileResult.data,
          tokens: newTokens,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      }

      return true;
    } catch {
      clearTokens();
      setState({
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await loginAction(email, password);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Login failed');
      }

      const tokens: AuthTokens = {
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresAt: Date.now() + result.data.expiresIn * 1000,
      };

      saveTokens(tokens);

      setState({
        user: result.data.user,
        tokens,
        isLoading: false,
        isAuthenticated: true,
      });

      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async (): Promise<void> => {
    clearTokens();
    setState({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/login');
  }, [router]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const tokens = getTokens();

      if (!tokens) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // If token is expired, try to refresh
      if (isTokenExpired(tokens)) {
        await refreshSession();
        return;
      }

      // Get current profile
      const profileResult = await getProfileAction(tokens.accessToken);
      if (profileResult.success && profileResult.data) {
        setState({
          user: profileResult.data,
          tokens,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Token might be invalid, try refresh
        await refreshSession();
      }
    };

    initAuth();
  }, [refreshSession]);

  // Handle route protection
  useEffect(() => {
    if (state.isLoading) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!state.isAuthenticated && !isPublicPath) {
      router.push('/login');
    } else if (state.isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!state.tokens || !state.isAuthenticated) return;

    const timeUntilExpiry = state.tokens.expiresAt - Date.now();
    // Refresh 60 seconds before expiry
    const refreshTime = Math.max(timeUntilExpiry - 60 * 1000, 0);

    const timeoutId = setTimeout(() => {
      refreshSession();
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [state.tokens, state.isAuthenticated, refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
