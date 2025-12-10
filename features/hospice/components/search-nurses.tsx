import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { Title } from '@/components/title/Title';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SmallLoader } from '@/features/shared/components/small-loader';
import {
  generateErrorMessage,
  sortedArrayByAvailability,
} from '@/features/shared/utils';
import { LegendList } from '@legendapp/list';
import { useMutation, useQuery } from 'convex/react';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useGetNurseId } from '../hooks/use-get-nurse-id';
import { NurseCard } from './nurse-card';
type Props = {
  query: string;
};
export const SearchNurses = ({ query }: Props) => {
  const todayToText = format(new Date(), 'EEEE');
  const { discipline, id } = useLocalSearchParams<{
    discipline: 'RN' | 'LVN' | 'HHA';
    id?: Id<'schedules'>;
  }>();
  const nurses = useQuery(api.nurses.searchNursesByFirstNameAndLastName, {
    name: query,
    todayToText,
    discipline,
  });
  const { hospice } = useHospice();
  const { showToast } = useToast();
  const sendReassignmentNotification = useMutation(
    api.assignments.sendReassignmentNotification
  );
  const nurseId = useGetNurseId((state) => state.id);
  const onReassign = async () => {
    if (!hospice || !hospice?._id || !nurseId || !id) return;
    try {
      await sendReassignmentNotification({
        scheduleId: id,
        hospiceId: hospice._id,
        nurseId,
        hospiceName: hospice.businessName as string,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Error sending reassignment notification'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    }
  };
  if (nurses === undefined) {
    return <SmallLoader size={50} />;
  }

  const onAction = (discipline?: string) => {
    if (id) {
      onReassign();
    } else {
      router.push(`/assign?discipline=${discipline}`);
    }
  };
  const sortedNurses = sortedArrayByAvailability(nurses);
  return (
    <View style={{ flex: 1 }}>
      <LegendList
        data={sortedNurses}
        recycleItems
        renderItem={({ item }) => (
          <NurseCard nurse={item} isAssigned onAction={onAction} />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
        columnWrapperStyle={{ gap: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Title textAlign="center" size={20}>
            {query.length > 0
              ? `No professionals found for "${query}" ${discipline ? 'under ' + discipline : ''}. `
              : 'Start typing to search for professionals.'}
          </Title>
        }
        style={{ flex: 1 }}
      />
    </View>
  );
};
