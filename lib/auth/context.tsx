'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getProfileAction, loginAction, logoutAction, refreshTokenAction } from './actions';
import { AuthContextType, AuthState } from './types';

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
    isLoading: true,
    isAuthenticated: false,
  });

  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | null>(null);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    // Токени зберігаються в httpOnly cookies, тому ми не маємо до них прямого доступу
    // Але можемо спробувати оновити сесію через server action
    // Якщо refresh token є в cookies, сервер його використає
    const result = await refreshTokenAction();
    if (!result.success) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      setTokenExpiresIn(null);
      return false;
    }

    // Зберігаємо expiresIn для планування наступного рефрешу
    setTokenExpiresIn(result.data.expiresIn);

    // Отримати оновлений профіль
    const profileResult = await getProfileAction();
    if (profileResult.success) {
      setState({
        user: profileResult.data,
        isLoading: false,
        isAuthenticated: true,
      });
      return true;
    }

    return false;
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await loginAction(email, password);

      if (!result.success) {
        throw new Error(result.error.detail || result.error.title);
      }

      // Зберігаємо expiresIn для планування рефрешу
      setTokenExpiresIn(result.data.expiresIn);

      // Токени збережено в cookies через loginAction
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
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    setTokenExpiresIn(null);
    router.push('/login');
  }, [router]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Спробуємо отримати профіль - якщо токен є в cookies, запит пройде
      const profileResult = await getProfileAction();

      if (profileResult.success && profileResult.data) {
        setState({
          user: profileResult.data,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Спробуємо оновити токен
        const refreshed = await refreshSession();
        if (!refreshed) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initAuth();
  }, [refreshSession]);

  // Handle route protection - тепер middleware це робить, але залишимо для клієнтської навігації
  useEffect(() => {
    if (state.isLoading) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!state.isAuthenticated && !isPublicPath) {
      router.push('/login');
    } else if (state.isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  // Auto-refresh token - на основі expiresIn від сервера
  useEffect(() => {
    if (!state.isAuthenticated || !tokenExpiresIn) return;

    // Оновлюємо токен за 60 секунд до закінчення терміну дії
    const refreshBeforeExpiry = 60; // секунд
    const refreshInterval = Math.max((tokenExpiresIn - refreshBeforeExpiry) * 1000, 60 * 1000);

    const timeoutId = setTimeout(() => {
      refreshSession();
    }, refreshInterval);

    return () => clearTimeout(timeoutId);
  }, [state.isAuthenticated, tokenExpiresIn, refreshSession]);

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
