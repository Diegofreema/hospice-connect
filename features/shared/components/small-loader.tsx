import { SpinnerArc } from '@/components/loaders';
import { palette } from '@/theme';
import View from './view';

type Props = {
  size?: number;
};

export const SmallLoader = ({ size = 20 }: Props) => {
  return (
    <View width={'100%'} alignItems={'center'} justifyContent={'center'}>
      <SpinnerArc
        size={size}
        colorEnd={palette.blue}
        colorStart={palette.lightBlue}
      />
    </View>
  );
};
