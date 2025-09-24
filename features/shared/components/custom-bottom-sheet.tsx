import { Title } from '@/components/title/Title';
import View from '@/features/shared/components/view';
import { palette } from '@/theme';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { IconX } from '@tabler/icons-react-native';
import { forwardRef, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
};

export const CustomSheet = forwardRef<BottomSheet, Props>(
  ({ onClose, children, title }, ref) => {
    const snapPoints = useMemo(() => ['25%', '50%'], []);

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
          <View
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Title style={{ fontFamily: 'PublicSansSemiBold' }} size={20}>
              {title}
            </Title>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconX size={20} color={palette.blue} />
            </TouchableOpacity>
          </View>
          <View>{children}</View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

CustomSheet.displayName = 'CustomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingVertical: 36,
    paddingHorizontal: 10,
    gap: 10,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: palette.grey,
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
    borderColor: palette.grey,
    width: '100%',
    flex: 1,
  },
});
