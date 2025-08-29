import { Button } from '@/features/shared/components/button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useAuthActions } from '@convex-dev/auth/react';

export default function HomeScreen() {
  const { signOut } = useAuthActions();
  return (
    <Wrapper>
      <Button label="Sign out" onPress={signOut} />
      <MyTitle title="Nurse" />
    </Wrapper>
  );
}
