import { getFontSize } from '../utils';
import { Text } from './text';
import { Stack } from './v-stack';

type Props = {
  leftText: string;
  rightText: string;
  isBold?: boolean;
};

export const FlexText = ({ leftText, rightText, isBold }: Props) => {
  return (
    <Stack mode="flex" gap="xl">
      <Text size={'normal'}>{leftText}</Text>

      <Text
        size={'normal'}
        isBold={isBold}
        fontSize={getFontSize(isBold ? 16 : 14)}
        textAlign="right"
      >
        {rightText}
      </Text>
    </Stack>
  );
};
