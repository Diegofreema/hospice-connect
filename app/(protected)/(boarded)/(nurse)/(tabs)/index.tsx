import { useNurse } from '@/components/context/nurse-context';
import { AvailableAssignments } from '@/features/nurse/components/available-assignments';
import { CompletedAssignments } from '@/features/nurse/components/completed-assignments';
import { InProgressAssignments } from '@/features/nurse/components/in-progress-assignments';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { TabSelectorIos } from '@/features/shared/components/tab-selector';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useState } from 'react';

const items = ['Available', 'In Progress', 'Completed'];
const components = [
  AvailableAssignments,
  InProgressAssignments,
  CompletedAssignments,
];
export default function HomeScreen() {
  const { nurse } = useNurse();
  const [selectedIndex, setSelectedIndex] = useState(0);
  if (nurse === null) return null;
  const name = nurse.firstName + ' ' + nurse.lastName;
  const Component = components[selectedIndex];
  return (
    <Wrapper gap="m">
      <AccountBrief data={{ name, image: nurse.image as string }} isHome />
      <TabSelectorIos
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        items={items}
      />
      <Component />
    </Wrapper>
  );
}
