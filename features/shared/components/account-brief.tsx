import { Avatar } from '@/components/avatar/Avatar';
import { Badge } from '@/components/badge/Badge';
import { Href, router } from 'expo-router';
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
};

export const AccountBrief = ({
  data,
  isHome = false,
  title = 'My account',
  href = '/nurse-profile',
}: Props) => {
  const onPress = () => {
    if (!href) return;
    router.push(href);
  };
  const fontSize = isHome ? 14 : 11;
  const fontColor = isHome ? 'black' : 'textGrey';
  return (
    <TouchableOpacity onPress={onPress} disabled={isHome}>
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
              {title}
            </Text>

            <Text size="normal">{data.name}</Text>
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
