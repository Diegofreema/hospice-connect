import { palette } from '@/theme';
import { SFSymbol } from 'expo-symbols';
import { StyleSheet } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import Text from './text';

type Props = {
  trigger: React.ReactNode;
  menuItems: { label: string; value: string; ios: SFSymbol; android: string }[];
  onClick: (value: string) => void;
};
export function MyMenu({ trigger, menuItems, onClick }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger style={styles.trigger}>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {menuItems.map((item) => (
          <DropdownMenu.Item
            key={item.value}
            onSelect={() => onClick(item.value)}
            textValue={item.label}
          >
            <DropdownMenu.ItemIcon
              ios={{
                name: item.ios,
                hierarchicalColor: {
                  dark: 'white',
                  light:
                    item.value === 'delete' ? palette.redDark : palette.black,
                },
              }}
              androidIconName={item.android}
            />
            <DropdownMenu.ItemTitle>
              <Text color={item.value === 'delete' ? 'error' : 'black'}>
                {item.label}
              </Text>
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        ))}

        <DropdownMenu.Arrow />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = StyleSheet.create({
  trigger: {},
});
