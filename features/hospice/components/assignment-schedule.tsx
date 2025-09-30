import { Text, View } from 'react-native';
import { useSelectAssignment } from '../hooks/use-select-assignment';

export const AssignmentSchedule = () => {
  const assignmentId = useSelectAssignment((state) => state.id);

  return (
    <View>
      <Text> {assignmentId}</Text>
    </View>
  );
};
