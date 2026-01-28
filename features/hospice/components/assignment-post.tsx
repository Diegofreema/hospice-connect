import { Card, CardContent, CardHeader } from '@/components/card';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { FlexText } from '@/features/shared/components/flex-text';

import {
  getAssignmentStatusText,
  getScheduleStatusAndColor,
  trimText,
} from '@/features/shared/utils';
import { View } from '../../shared/components/view';

import { SymbolView } from 'expo-symbols';

import { Badge } from '@/components/badge/Badge';
import { type BadgeVariant } from '@/components/badge/types';
import { type api } from '@/convex/_generated/api';
import { Text } from '@/features/shared/components/text';
import { type FunctionReturnType } from 'convex/server';
import { StyleSheet } from 'react-native-unistyles';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { useUpdatePostStatus } from '../hooks/use-update-post-status';

type Props = {
  post: FunctionReturnType<typeof api.posts.getOurAvailablePosts>[number];

  onOpen: () => void;
};

export const AssignmentPost = ({
  post,

  onOpen,
}: Props) => {
  const name = `${post.patientFirstName} ${post.patientLastName}`;
  const setAssignmentId = useSelectAssignment((state) => state.setId);
  useUpdatePostStatus({ assignmentId: post._id, status: post.status });

  const disabled = post.status === 'booked';
  const handleOpen = () => {
    setAssignmentId(post._id);
    onOpen();
  };
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}>
        <Text size={'normal'}>{trimText(name, 15)}</Text>
      </CardHeader>
      <CardContent style={styles.content}>
        <View
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text size={'normal'}>Status</Text>
          <Badge
            label={getAssignmentStatusText(post.status)}
            variant={
              getScheduleStatusAndColor(post.status).status as BadgeVariant
            }
            icon={
              <SymbolView
                name="circle.fill"
                size={12}
                tintColor={getScheduleStatusAndColor(post.status).color}
              />
            }
          />
        </View>
        <FlexText leftText="Phone number" rightText={post.phoneNumber} />
        <FlexText leftText="Care level" rightText={post.careLevel} />
        <FlexText leftText="Discipline" rightText={post.discipline} />
        <FlexText leftText="Discipline" rightText={post.endDate} />

        <FlexText
          leftText="Location"
          rightText={trimText(post.patientAddress, 20)}
        />
        <View flexDirection="row" gap="lg" style={styles.footer}>
          <CustomPressable
            onPress={handleOpen}
            style={[
              styles.button,
              styles.assign,
              { opacity: disabled ? 0.5 : 1 },
            ]}
            disabled={disabled}
          >
            <Text size={'normal'} color={'white'}>
              Assign
            </Text>
          </CustomPressable>
        </View>
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.cardGrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trigger: {
    padding: 5,
    borderRadius: 5,
  },
  content: {
    gap: 10,
    marginTop: -10,
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  viewSchedule: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.cardGrey,
  },
  assign: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    backgroundColor: theme.colors.blue,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
}));
