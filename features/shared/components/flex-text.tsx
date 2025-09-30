import { getFontSize } from '../utils';
import { Text } from './text';
import { Stack } from './v-stack';

type Props = {
  leftText: string;
  rightText: string;
};

export const FlexText = ({ leftText, rightText }: Props) => {
  return (
    <Stack mode="flex">
      <Text size={'normal'}>{leftText}</Text>
      <Text size={'normal'} isMedium fontSize={getFontSize(14)}>
        {rightText}
      </Text>
    </Stack>
  );
};
