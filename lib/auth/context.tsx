'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getProfileAction, loginAction, logoutAction, refreshTokenAction } from './actions';
import { TOKEN_EXPIRY_BUFFER_MS } from './constants';
import { AuthContextType, AuthState } from './types';

// ============================================================================
// Constants
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);
const PUBLIC_PATHS = ['/login'];

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const unauthenticatedState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

// ============================================================================
// Provider Props
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Auth Provider
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<AuthState>(initialState);
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | null>(null);

  // --------------------------------------------------------------------------
  // Auth Actions
  // --------------------------------------------------------------------------

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const result = await refreshTokenAction();

    if (!result.success) {
      setState(unauthenticatedState);
      setTokenExpiresIn(null);
      return false;
    }

    setTokenExpiresIn(result.data.expiresIn);
    return true;
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await loginAction(email, password);

      if (!result.success) {
        throw new Error(result.error.detail || result.error.title);
      }

      setTokenExpiresIn(result.data.expiresIn);
      setState({
        user: result.data.user,
        isLoading: false,
        isAuthenticated: true,
      });

      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutAction();
    setState(unauthenticatedState);
    setTokenExpiresIn(null);
    router.push('/login');
  }, [router]);

  // --------------------------------------------------------------------------
  // Initialize Auth State
  // --------------------------------------------------------------------------

  useEffect(() => {
    const initAuth = async () => {
      const profileResult = await getProfileAction();

      if (profileResult.success) {
        setState({
          user: profileResult.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        setTokenExpiresIn(profileResult.data.expiresIn);
      } else {
        setState(unauthenticatedState);
      }
    };

    initAuth();
  }, []);

  // --------------------------------------------------------------------------
  // Client-Side Route Protection
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (state.isLoading) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!state.isAuthenticated && !isPublicPath) {
      router.push('/login');
    } else if (state.isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  // --------------------------------------------------------------------------
  // Auto-Refresh Token
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!state.isAuthenticated || tokenExpiresIn === null) return;

    const bufferSeconds = TOKEN_EXPIRY_BUFFER_MS / 1000;

    // Token already expired or expiring soon → refresh immediately
    if (tokenExpiresIn <= bufferSeconds) {
      refreshSession();
      return;
    }

    // Schedule refresh before token expires
    const refreshDelayMs = (tokenExpiresIn - bufferSeconds) * 1000;
    const timeoutId = setTimeout(refreshSession, refreshDelayMs);

    return () => clearTimeout(timeoutId);
  }, [state.isAuthenticated, tokenExpiresIn, refreshSession]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
