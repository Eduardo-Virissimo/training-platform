import { getUserFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InstructorStudio from './studio';

export default async function InstructorPage() {
  const user = await getUserFromSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <InstructorStudio />;
}
