import { getFontSize } from '../utils';
import Text from './text';
import View from './view';

type Props = {
  leftText: string;
  rightText: string;
};

export const FlexText = ({ leftText, rightText }: Props) => {
  return (
    <View
      flexDirection={'row'}
      justifyContent={'space-between'}
      alignItems={'center'}
    >
      <Text variant={'body'}>{leftText}</Text>
      <Text variant={'subheader'} fontSize={getFontSize(14)}>
        {rightText}
      </Text>
    </View>
  );
};
