import { Button } from '@/features/shared/components/button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useAuthActions } from '@convex-dev/auth/react';

export default function HomeScreen() {
  const { signOut } = useAuthActions();
  return (
    <Wrapper>
      <Button label="Sign out" onPress={signOut} />
    </Wrapper>
  );
}
