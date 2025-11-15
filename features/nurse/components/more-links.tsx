import { LogOut } from '@/features/shared/components/log-out';
import { TabBarIcon } from '@/features/shared/components/tab-bar-icon';
import { Text } from '@/features/shared/components/text';
import { View } from '../../shared/components/view';

import { IconChevronRight } from '@tabler/icons-react-native';
import { Href, router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { FlatList, TouchableOpacity } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { LinkType } from '../types';
type Props = {
  links: LinkType[];
};

export const MoreLinks = ({ links }: Props) => {
  const { theme } = useUnistyles();
  const onPress = async (link: Href, type: 'external' | 'internal') => {
    if (type === 'external') {
      await openBrowserAsync(link as string);
    } else {
      router.push(link);
    }
  };

  return (
    <FlatList
      data={links}
      renderItem={({ item }) => {
        const isExternal = [
          'Support',
          'Privacy Policy',
          'Terms of Service',
        ].includes(item.label);
        const type = isExternal ? 'external' : 'internal';
        return (
          <TouchableOpacity onPress={() => onPress(item.link, type)}>
            <View
              flexDirection={'row'}
              alignItems={'center'}
              justifyContent={'space-between'}
              p={'md'}
            >
              <View gap="sm" flexDirection={'row'} alignItems={'center'}>
                <View
                  borderRadius={'full'}
                  p={'lg'}
                  backgroundColor={theme.colors.lightBlue}
                >
                  <TabBarIcon
                    icon={item.icon}
                    size={24}
                    color={theme.colors.blue}
                  />
                </View>
                <Text size="normal">{item.label}</Text>
              </View>
              <TabBarIcon
                icon={IconChevronRight}
                size={25}
                color={theme.colors.blue}
              />
            </View>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.link.toString()}
      contentContainerStyle={{ gap: 10, flexGrow: 1 }}
      ListFooterComponent={LogOut}
      ListFooterComponentStyle={{ marginTop: 10 }}
    />
  );
};
