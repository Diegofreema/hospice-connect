import { useNurse } from '@/components/context/nurse-context';
import { SegmentedControl } from '@/components/segmented-control';
import { AvailableAssignments } from '@/features/nurse/components/available-assignments';
import { CompletedAssignments } from '@/features/nurse/components/completed-assignments';
import { InProgressAssignments } from '@/features/nurse/components/in-progress-assignments';
import { AccountBrief } from '@/features/shared/components/account-brief';

import { Wrapper } from '@/features/shared/components/wrapper';
import { palette } from '@/theme';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

type Variants = 'available' | 'in-progress' | 'completed';
export default function HomeScreen() {
  const { nurse } = useNurse();

  const [selectedValue, setSelectedValue] = useState<Variants>('available');
  if (nurse === null) return null;
  const name = nurse.firstName + ' ' + nurse.lastName;

  return (
    <Wrapper gap="m">
      <AccountBrief data={{ name, image: nurse.image as string }} isHome />
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

const styles = StyleSheet.create({
  active: {
    borderBottomColor: palette.blue,
  },
  normal: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#ccc',
    flex: 1,
  },
});
