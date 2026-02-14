import { ErrorComponent } from '@/features/shared/components/error';
import { authClient } from '@/lib/auth-client';
import { createContext, useContext } from 'react';

type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  userId?: string | null | undefined;
  isBoarded: boolean;
  role: string;
  streamToken?: string;
};
const AuthContext = createContext({
  user: null as User | null,
  isPending: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  if (error) {
    return <ErrorComponent text={error.message} refetch={refetch} />;
  }

  return (
    <AuthContext.Provider
      value={{
        user: (session?.user as User) || null,
        isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
