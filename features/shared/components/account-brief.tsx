import { Avatar } from '@/components/avatar/Avatar';
import { Badge } from '@/components/badge/Badge';
import { Href, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TouchableOpacity } from 'react-native';
import { getFontSize } from '../utils';
import { NotificationButton } from './notification-btn';
import Text from './text';
import View from './view';

type Props = {
  data: {
    name: string;
    image?: string;
  };
  isHome?: boolean;
  title?: string;
  href?: Href;
};

export const AccountBrief = ({
  data,
  isHome = false,
  title = 'My account',
  href = '/nurse-profile',
}: Props) => {
  const onPress = () => {
    router.push(href);
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
            {!isHome && (
              <Text
                variant="small"
                color={'textGrey'}
                fontSize={getFontSize(11)}
              >
                {title}
              </Text>
            )}
            <Text variant="body">{data.name}</Text>
          </View>
        </View>
        {!isHome && (
          <Badge
            label="Verified"
            radius="full"
            size="sm"
            variant="success"
            icon={
              <SymbolView
                name="circle.fill"
                size={12}
                tintColor={'lightgreen'}
              />
            }
          />
        )}
        {isHome && <NotificationButton />}
      </View>
    </TouchableOpacity>
  );
};
