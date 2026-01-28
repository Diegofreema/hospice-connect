import { type StyleProp, type ViewStyle } from 'react-native';

export type SegmentedControlItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export type SegmentedControlRootProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  theme?: 'dark' | 'light';
  className?: string;
};
