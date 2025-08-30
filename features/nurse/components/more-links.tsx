import { IconSymbol } from '@/components/ui/IconSymbol';
import { LogOut } from '@/features/shared/components/log-out';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { palette } from '@/theme';
import { Href, router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { FlatList, TouchableOpacity } from 'react-native';
import { LinkType } from '../types';
type Props = {
  links: LinkType[];
};

export const MoreLinks = ({ links }: Props) => {
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
        const type =
          item.label === 'Support' || item.label === 'Privacy Policy'
            ? 'external'
            : 'internal';
        return (
          <TouchableOpacity onPress={() => onPress(item.link, type)}>
            <View
              flexDirection={'row'}
              alignItems={'center'}
              justifyContent={'space-between'}
              padding={'m'}
            >
              <View gap="s" flexDirection={'row'} alignItems={'center'}>
                <View
                  borderRadius={100}
                  padding={'s'}
                  backgroundColor={'lightBlue'}
                >
                  <IconSymbol name={item.name} size={24} color={palette.blue} />
                </View>
                <Text variant="body">{item.label}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={palette.blue} />
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
