import { Avatar } from '@/components/avatar/Avatar';
import { Badge } from '@/components/badge/Badge';
import { type Href, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TouchableOpacity } from 'react-native';
import { getFontSize } from '../utils';
import { NotificationButton } from './notification-btn';
import { Text } from './text';
import { View } from './view';

type Props = {
  data: {
    name: string;
    image?: string;
  };
  isHome?: boolean;
  title?: string;
  href?: Href;
  count?: number;
  verified: boolean;
};

export const AccountBrief = ({
  data,
  isHome = false,
  title = 'My account',
  href = '/nurse-profile',
  count,
  verified,
}: Props) => {
  const onPress = () => {
    if (!href) return;
    router.push(href);
  };
  const fontSize = isHome ? 14 : 11;
  const fontColor = isHome ? 'black' : 'textGrey';

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <View flexDirection={'row'} alignItems={'center'} gap="sm">
          <Avatar
            image={{ uri: data.image || '', name: data.name }}
            size={60}
          />
          <View>
            <Text
              size="small"
              color={fontColor}
              fontSize={getFontSize(fontSize)}
              isBold
            >
              Hello
            </Text>

            <Text size="normal">{data.name}</Text>
          </View>
        </View>
        {!isHome && (
          <Badge
            label={verified ? 'Verified' : 'Not verified'}
            radius="full"
            size="sm"
            variant={verified ? 'success' : 'error'}
            icon={
              <SymbolView
                name="circle.fill"
                size={12}
                tintColor={verified ? 'lightgreen' : 'red'}
              />
            }
          />
        )}
        {isHome && <NotificationButton count={count} />}
      </View>
    </TouchableOpacity>
  );
};
