'use client';

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster />
      {children}
    </AuthProvider>
  );
}
