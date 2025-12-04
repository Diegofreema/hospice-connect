import { getFontSize } from '../utils';
import { Text } from './text';
import { Stack } from './v-stack';

type Props = {
  leftText: string;
  rightText: string;
};

export const FlexText = ({ leftText, rightText }: Props) => {
  return (
    <Stack mode="flex" gap="xl">
      <Text size={'normal'}>{leftText}</Text>
      {leftText.toLowerCase() === 'discipline' ? (
        <Text
          size={'normal'}
          isBold
          fontSize={getFontSize(16)}
          textAlign="right"
        >
          {rightText}
        </Text>
      ) : (
        <Text
          size={'normal'}
          isMedium
          fontSize={getFontSize(14)}
          textAlign="right"
        >
          {rightText}
        </Text>
      )}
    </Stack>
  );
};
