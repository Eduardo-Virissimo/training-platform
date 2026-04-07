'use client';
import { Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoutButton from './logout-button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { NavLink } from './NavLink';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky bg-secondary/40 top-0 z-40 border-b border-border backdrop-blur-md p-2">
      <div className="flex h-10 md:h-min items-center justify-between px-4 md:px-8 duration-150">
        {/* Mobile menu */}
        <div className="flex items-center gap-3 md:hidden">
          <Sheet>
            <SheetTrigger>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-card p-6">
              <SheetTitle className="text-lg font-bold text-foreground mb-6">Menu</SheetTitle>
              <nav className="flex flex-col gap-2">
                <NavLink to="/dashboard" label="Trilhas" />
                <NavLink to="/profile" label="Meu Perfil" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground hidden sm:block">TrainUp </h2>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            className="relative grid text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className={'flex items-center gap-2'}>
              <Avatar className="grid cursor-pointer rounded-full">
                <AvatarImage src={user?.avatarFile?.usageId} />
                <AvatarFallback className="grid bg-primary text-white rounded-full">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium text-foreground md:block">
                {user?.name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n)
                  .join(' ')}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="grid p-2 max-w-full w-60">
              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                <User />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
