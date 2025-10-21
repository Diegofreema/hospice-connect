import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { FetchNurses } from '@/features/hospice/components/fetch-nurses';
import { RateRange } from '@/features/hospice/components/rate-range';
import { nurseFilter } from '@/features/hospice/constants';
import { NurseType } from '@/features/hospice/types';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { CustomerSelector } from '@/features/shared/components/custom-selector';

import { PressableIcon } from '@/features/shared/components/pressable-icon';
import { SearchComponent } from '@/features/shared/components/search-component';
import { Stack } from '@/features/shared/components/v-stack';
import { Wrapper } from '@/features/shared/components/wrapper';

import BottomSheet from '@gorhom/bottom-sheet';
import { IconFilter2 } from '@tabler/icons-react-native';
import { useQuery } from 'convex/react';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

export default function HomeScreen() {
  const { hospice } = useHospice();
  const [selected, setSelected] = useState<'All' | NurseType>('All');
  const [range, setRange] = useState({
    rate1: '5',
    rate2: '1000',
  });
  const unreadCount = useQuery(
    api.hospiceNotification.unreadMessagesCount,
    hospice && hospice._id ? { hospiceId: hospice._id } : 'skip'
  );
  const bottomSheetRef = useRef<BottomSheet>(null);

  const onOpenSheet = () => {
    bottomSheetRef.current?.expand();
  };
  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
  };
  if (hospice === null) return null;

  return (
    <>
      <Wrapper>
        <AccountBrief
          data={{
            name: hospice.businessName || 'N/A',
            image: hospice.image as string,
          }}
          title="Hello,"
          href={'/business-profile'}
          isHome
          count={unreadCount || 0}
        />
        <Stack gap={'lg'} mode="flexCentered">
          <SearchComponent
            placeholder="Search"
            path={'/search-nurses'}
            isButton
          />
          <PressableIcon
            onPress={onOpenSheet}
            icon={IconFilter2}
            style={styles.icon}
          />
        </Stack>
        <CustomerSelector
          data={nurseFilter}
          selected={selected}
          setSelected={(selected) => setSelected(selected as 'All' | NurseType)}
        />
        <FetchNurses
          nurseType={selected}
          rate1={range.rate1}
          rate2={range.rate2}
        />
      </Wrapper>
      <CustomSheet
        title="Filter"
        customSnapPoints={['50%']}
        ref={bottomSheetRef}
        onClose={onCloseSheet}
      >
        <RateRange setRange={setRange} range={range} />
      </CustomSheet>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  icon: {
    backgroundColor: theme.colors.buttonGrey,
    borderRadius: 8,
    padding: 14,
  },
}));
