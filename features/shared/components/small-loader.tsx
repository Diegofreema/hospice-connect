import { SpinnerArc } from '@/components/loaders';
import { useUnistyles } from 'react-native-unistyles';
import { Stack } from './v-stack';

type Props = {
  size?: number;
};

export const SmallLoader = ({ size = 20 }: Props) => {
  const { theme } = useUnistyles();
  return (
    <Stack flex={1} isCentered backgroundColor="white">
      <SpinnerArc
        size={size}
        colorEnd={theme.colors.blue}
        colorStart={theme.colors.lightBlue}
      />
    </Stack>
  );
};
