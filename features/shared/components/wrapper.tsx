import { PropsWithChildren } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { Stack } from './v-stack';

type Props = {
  gap?: 'sm' | 'md' | 'lg' | 'xl';
};

export const Wrapper = ({ children, gap = 'xl' }: PropsWithChildren<Props>) => {
  const { theme } = useUnistyles();
  return (
    <Stack flex={1} ph={15} gap={gap} backgroundColor={theme.colors.background}>
      {children}
    </Stack>
  );
};
