import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';
import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
export type IconSymbolName = keyof typeof MAPPING;
export const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;
export type LinkType = {
  name: IconSymbolName;
  label: string;
  link: Href;
};
