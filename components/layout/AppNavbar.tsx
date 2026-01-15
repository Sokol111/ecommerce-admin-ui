'use client';

import { UserMenu } from '@/components/auth';

export default function AppNavbar() {
  return (
    <header className="flex sticky top-0 h-16 items-center justify-between border-b px-4 bg-white">
      <h1 className="text-xl font-bold">Ecommerce Admin UI</h1>
      <UserMenu />
    </header>
  );
}
