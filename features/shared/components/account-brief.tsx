import { Avatar } from '@/components/avatar/Avatar';
import { Badge } from '@/components/badge/Badge';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TouchableOpacity } from 'react-native';
import { getFontSize } from '../utils';
import Text from './text';
import View from './view';

type Props = {
  data: {
    name: string;
    image?: string;
  };
};

export const AccountBrief = ({ data }: Props) => {
  const onPress = () => {
    router.push('/nurse-profile');
  };
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <View flexDirection={'row'} alignItems={'center'} gap="s">
          <Avatar
            image={{ uri: data.image || '', name: data.name }}
            size={60}
          />
          <View>
            <Text variant="small" color={'textGrey'} fontSize={getFontSize(11)}>
              My account
            </Text>
            <Text variant="body">{data.name}</Text>
          </View>
        </View>
        <Badge
          label="Verified"
          radius="full"
          size="sm"
          variant="success"
          icon={
            <SymbolView name="circle.fill" size={12} tintColor={'lightgreen'} />
          }
        />
      </View>
    </TouchableOpacity>
  );
};
