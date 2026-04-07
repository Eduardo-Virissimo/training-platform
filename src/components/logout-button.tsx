'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <Button
      variant="destructive"
      className="w-full flex gap-2"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut />
      {loading ? 'Saindo...' : 'Sair'}
    </Button>
  );
}
