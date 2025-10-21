import { getFontSize } from '../utils';
import { Text } from './text';
import { Stack } from './v-stack';

type Props = {
  leftText: string;
  rightText: string;
};

export const FlexText = ({ leftText, rightText }: Props) => {
  return (
    <Stack mode="flex" flex={1} gap="xl">
      <Text size={'normal'}>{leftText}</Text>
      <Text
        size={'normal'}
        isMedium
        fontSize={getFontSize(14)}
        textAlign="right"
        style={{ flex: 1 }}
      >
        {rightText}
      </Text>
    </Stack>
  );
};
