import { Theme } from '@/theme';
import {
  createRestyleComponent,
  createVariant,
  VariantProps,
} from '@shopify/restyle';
import View from './view';

export const Card = createRestyleComponent<
  VariantProps<Theme, 'cardVariants'> & React.ComponentProps<typeof View>,
  Theme
>(
  [
    createVariant({
      themeKey: 'cardVariants',
    }),
  ],
  View
);
