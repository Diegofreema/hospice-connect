import { LogOut } from '@/features/shared/components/log-out';
import { TabBarIcon } from '@/features/shared/components/tab-bar-icon';
import { Text } from '@/features/shared/components/text';
import React, { useMemo } from 'react';
import { View } from '../../shared/components/view';

import { useGetAccount } from '@/hooks/use-get-account';
import { IconChevronRight, IconPasswordUser } from '@tabler/icons-react-native';
import { type Href, router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { FlatList, TouchableOpacity } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { type LinkType } from '../types';

type Props = {
  links: LinkType[];
  isSuspended?: boolean;
};

export const MoreLinks = ({ links, isSuspended }: Props) => {
  const { theme } = useUnistyles();
  const onPress = async (link: Href, type: 'external' | 'internal') => {
    if (type === 'external') {
      await openBrowserAsync(link as string);
    } else {
      router.push(link);
    }
  };
  const { data: account } = useGetAccount();
  const isCredentialAccount = !!(
    account && account?.find((account) => account.providerId === 'credentials')
  );

  const displayLinks = useMemo(() => {
    const list = [...links];
    if (isCredentialAccount) {
      const hasChangePassword = list.some(
        (link) => link.label === 'Change Password',
      );
      if (!hasChangePassword) {
        const lastIndex = Math.max(0, list.length - 1);
        list.splice(lastIndex, 0, {
          label: 'Change Password',
          icon: IconPasswordUser,
          link: '/change-password' as any,
        });
      }
    }
    return list;
  }, [links, isCredentialAccount]);

  return (
    <FlatList
      data={displayLinks}
      renderItem={({ item }) => {
        const isExternal = ['Privacy Policy', 'Terms of Service'].includes(
          item.label,
        );
        const type = isExternal ? 'external' : 'internal';
        const disabled = isSuspended && item.label === 'Availability';
        const isDeleteAccount = item.label === 'Delete Account';
        return (
          <TouchableOpacity
            disabled={disabled}
            onPress={() => onPress(item.link, type)}
          >
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
                  backgroundColor={
                    isDeleteAccount
                      ? 'rgba(255, 0, 0, 0.1)'
                      : theme.colors.lightBlue
                  }
                >
                  <TabBarIcon
                    icon={item.icon}
                    size={24}
                    color={isDeleteAccount ? 'red' : theme.colors.blue}
                  />
                </View>
                <Text size="normal" color={isDeleteAccount ? 'red' : 'black'}>
                  {item.label}
                </Text>
              </View>
              <TabBarIcon
                icon={IconChevronRight}
                size={25}
                color={isDeleteAccount ? 'red' : theme.colors.blue}
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
