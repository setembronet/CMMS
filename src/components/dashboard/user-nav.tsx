'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { usePathname } from 'next/navigation';

export function UserNav() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const pathname = usePathname();
  const isSaas = pathname.startsWith('/dashboard');

  const logoutLink = isSaas ? '/saas-login' : '/';
  const settingsLink = isSaas ? '/dashboard/settings' : '/client/settings';


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {userAvatar && (
               <AvatarImage asChild src={userAvatar.imageUrl}>
                <Image 
                    src={userAvatar.imageUrl} 
                    alt="User Avatar" 
                    width={36} 
                    height={36} 
                    data-ai-hint={userAvatar.imageHint} 
                />
               </AvatarImage>
            )}
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{isSaas ? 'Admin Master' : 'João Silva'}</p>
            <p className="text-xs leading-none text-muted-foreground">{isSaas ? 'admin@tenantcare.com' : 'joao.silva@atlas.com'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={settingsLink}>Configurações</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link href={logoutLink}>Sair</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
