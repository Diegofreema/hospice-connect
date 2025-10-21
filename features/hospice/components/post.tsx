import { Card, CardContent, CardHeader } from '@/components/card';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { FlexText } from '@/features/shared/components/flex-text';
import { MyMenu } from '@/features/shared/components/menu';

import {
  generateErrorMessage,
  getAssignmentStatusText,
  getScheduleStatusAndColor,
} from '@/features/shared/utils';
import { View } from '../../shared/components/view';

import { IconCircle, IconDots } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { SFSymbol } from 'expo-symbols';

import { Badge } from '@/components/badge/Badge';
import { BadgeVariant } from '@/components/badge/types';
import { useModal } from '@/components/demos/modal/hook/use-modal';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Text } from '@/features/shared/components/text';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { useUpdatePostStatus } from '../hooks/use-update-post-status';
import { PostType } from '../types';

type Props = {
  post: PostType;
  onView: () => void;
  hospiceId: Id<'hospices'>;
  onOpenReOpenAssignment: () => void;
};

const data: { label: string; value: string; ios: SFSymbol; android: string }[] =
  [
    {
      label: 'Edit',
      value: 'edit',
      ios: 'pencil',
      android: 'mode-edit',
    },
    {
      label: 'Delete',
      value: 'delete',
      ios: 'trash',
      android: 'trash',
    },
  ];
export const Post = ({
  post,
  onView,
  hospiceId,
  onOpenReOpenAssignment,
}: Props) => {
  const name = post.patientFirstName + ' ' + post.patientLastName;
  const { showModal, clearModal } = useModal();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const deleteAssignment = useMutation(api.assignments.deleteAssignment);
  useUpdatePostStatus({ assignmentId: post._id });
  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteAssignment({ assignmentId: post._id, hospiceId });
      showToast({
        title: 'Success',
        subtitle: 'Assignment deleted successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to delete assignment'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setDeleting(false);
      clearModal('delete-post');
    }
  };

  const setId = useSelectAssignment((state) => state.setId);
  const { theme } = useUnistyles();
  const onClick = (value: string) => {
    if (value === 'edit') {
      router.push(`/edit/${post._id}`);
    }

    if (value === 'delete') {
      showModal({
        title: 'Delete Assignment',
        message: 'Are you sure you want to delete this assignment?',
        onConfirm: async () => onDelete(),
        onDismiss: () => clearModal('delete-post'),
        iconName: 'alert',
        trailing: <Text>This can not be undone</Text>,
        key: 'delete-post',
      });
    }
  };
  const onReOpen = async () => {
    onOpenReOpenAssignment();
  };
  const onAssign = () => {
    router.push(`/assign-nurse?id=${post._id}&discipline=${post.discipline}`);
  };
  const onHandleAction = () => {
    if (post.status === 'completed' || post.status === 'cancelled') {
      onReOpen();
      setId(post._id);
    } else {
      onAssign();
    }
  };
  const disabled = post.status === 'booked';
  const buttonText =
    post.status === 'completed' || post.status === 'cancelled'
      ? 'Re-Open'
      : 'Assign';
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}>
        <Text size={'medium'} isBold>
          {name}
        </Text>
        <MyMenu
          disabled={deleting}
          trigger={
            <View style={styles.trigger}>
              <IconDots color={theme.colors.black} size={20} />
            </View>
          }
          menuItems={data}
          onClick={onClick}
        />
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
              <IconCircle
                size={12}
                fill={getScheduleStatusAndColor(post.status).color}
                color={getScheduleStatusAndColor(post.status).color}
              />
            }
          />
        </View>
        <FlexText leftText="Phone number" rightText={post.phoneNumber} />
        <FlexText leftText="Care level" rightText={post.careLevel} />
        <FlexText leftText="Discipline" rightText={post.discipline} />

        <FlexText leftText="Location" rightText={post.patientAddress} />
        <View flexDirection="row" gap="lg" style={styles.footer}>
          <CustomPressable
            onPress={() => {
              setId(post._id);
              onView();
            }}
            style={[styles.button, styles.viewSchedule]}
          >
            <Text size={'normal'} color={'blue'}>
              View Schedule
            </Text>
          </CustomPressable>

          <CustomPressable
            onPress={onHandleAction}
            style={[
              styles.button,
              styles.assign,
              { opacity: disabled ? 0.5 : 1 },
            ]}
            disabled={disabled}
          >
            <Text size={'normal'} color={'white'}>
              {buttonText}
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
