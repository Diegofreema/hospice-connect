import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
type Props = object;

export const AvailabilitySheet = forwardRef<BottomSheet, Props>(
  (props, ref) => {
    const snapPoints = useMemo(() => ['25%', '50%'], []);
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AvailabilitySheet.displayName = 'AvailabilitySheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});
