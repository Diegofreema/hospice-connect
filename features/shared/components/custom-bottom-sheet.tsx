import { Title } from '@/components/title/Title';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { IconX } from '@tabler/icons-react-native';
import { forwardRef, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Stack } from './v-stack';

type Props = {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  customSnapPoints?: string[];
};

export const CustomSheet = forwardRef<BottomSheet, Props>(
  ({ onClose, children, title, customSnapPoints }, ref) => {
    const snapPoints = useMemo(() => {
      if (customSnapPoints && customSnapPoints?.length > 0)
        return customSnapPoints;
      return ['25%', '50%'];
    }, [customSnapPoints]);
    const { theme } = useUnistyles();
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleComponent={null}
        backdropComponent={BottomSheetBackdrop}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Stack mode="flex">
            <Title style={{ fontFamily: 'PublicSansSemiBold' }} size={20}>
              {title}
            </Title>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconX size={20} color={theme.colors.blue} />
            </TouchableOpacity>
          </Stack>
          <View>{children}</View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

CustomSheet.displayName = 'CustomSheet';

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    flex: 1,
    paddingVertical: 36,
    paddingHorizontal: 10,
    gap: 10,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: theme.colors.grey,
    borderRadius: 100,
    padding: 5,
  },
  checkBox: {
    borderRadius: 100,
  },
  border: {
    backgroundColor: 'transparent',
    minHeight: 52,
    borderRadius: 5,
    paddingLeft: 5,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.grey,
    width: '100%',
    flex: 1,
  },
}));
