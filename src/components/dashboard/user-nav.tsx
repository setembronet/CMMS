
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useClient } from '@/context/client-provider';

export function UserNav() {
  const { t } = useI18n();
  const router = useRouter();
  const auth = useAuth();
  const { currentUser } = useClient();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch(e) {
      console.error("Logout failed", e);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {currentUser?.avatarUrl ? (
               <AvatarImage asChild src={currentUser.avatarUrl}>
                <Image 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name}
                    width={36} 
                    height={36} 
                />
               </AvatarImage>
            ) : userAvatar ? (
               <AvatarImage asChild src={userAvatar.imageUrl}>
                <Image 
                    src={userAvatar.imageUrl} 
                    alt="User Avatar" 
                    width={36} 
                    height={36} 
                    data-ai-hint={userAvatar.imageHint} 
                />
               </AvatarImage>
            ) : (
              <AvatarFallback>{currentUser ? getInitials(currentUser.name) : '...'}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">{t('userNav.settings')}</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
            {t('userNav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
