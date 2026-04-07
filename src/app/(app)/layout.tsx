import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Header from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <AuthProvider>
        <Header />
        <main>{children}</main>
      </AuthProvider>
    </div>
  );
}
