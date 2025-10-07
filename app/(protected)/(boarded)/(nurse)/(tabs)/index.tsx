import { useNurse } from '@/components/context/nurse-context';
import { SegmentedControl } from '@/components/segmented-control';
import { api } from '@/convex/_generated/api';
import { AvailableAssignments } from '@/features/nurse/components/available-assignments';
import { CompletedAssignments } from '@/features/nurse/components/completed-assignments';
import { InProgressAssignments } from '@/features/nurse/components/in-progress-assignments';
import { AccountBrief } from '@/features/shared/components/account-brief';

import { Wrapper } from '@/features/shared/components/wrapper';
import { useQuery } from 'convex/react';

import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

type Variants = 'available' | 'in-progress' | 'completed';
export default function HomeScreen() {
  const { nurse } = useNurse();
  const unreadCount = useQuery(
    api.nurseNotifications.unreadMessagesCount,
    nurse ? { nurseId: nurse._id } : 'skip'
  );
  const [selectedValue, setSelectedValue] = useState<Variants>('available');
  if (nurse === null) return null;
  const name = nurse.firstName + ' ' + nurse.lastName;

  return (
    <Wrapper gap="md">
      <AccountBrief
        data={{ name, image: nurse.image as string }}
        isHome
        count={unreadCount || 0}
      />
      <SegmentedControl.Root
        value={selectedValue}
        onValueChange={(value) => setSelectedValue(value as Variants)}
      >
        <SegmentedControl.Item
          value="available"
          style={[
            styles.normal,
            selectedValue === 'available' && styles.active,
          ]}
        >
          Available
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value="in-progress"
          style={[
            styles.normal,
            selectedValue === 'in-progress' && styles.active,
          ]}
        >
          In Progress
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value="completed"
          style={[
            styles.normal,
            selectedValue === 'completed' && styles.active,
          ]}
        >
          Completed
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      {selectedValue === 'available' && <AvailableAssignments />}
      {selectedValue === 'in-progress' && <InProgressAssignments />}
      {selectedValue === 'completed' && <CompletedAssignments />}
    </Wrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  active: {
    borderBottomColor: theme.colors.blue,
  },
  normal: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#ccc',
    flex: 1,
  },
}));
