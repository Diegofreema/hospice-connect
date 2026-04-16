'use client';

import { LogOut } from 'lucide-react-native';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { useAuth } from '@/components/context/auth';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { toast } from 'sonner-native';

export function AdminHeader() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onLogout = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onError: ({ error }) => {
          toast.error('Error', {
            description: error.message || error.statusText,
          });
          setLoading(false);
        },
        onSuccess: () => {
          toast.success('Success', {
            description: 'You have been logged out successfully',
          });
          setLoading(false);
          router.push('/');
        },
      },
    });
  };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold hidden md:block">
          HospiceConnect Management System
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} disabled={loading}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
