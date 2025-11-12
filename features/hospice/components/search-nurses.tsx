import { Title } from '@/components/title/Title';
import { api } from '@/convex/_generated/api';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { sortedArrayByAvailability } from '@/features/shared/utils';
import { LegendList } from '@legendapp/list';
import { useQuery } from 'convex/react';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { NurseCard } from './nurse-card';
type Props = {
  query: string;
};
export const SearchNurses = ({ query }: Props) => {
  const todayToText = format(new Date(), 'EEEE');
  const { discipline } = useLocalSearchParams<{
    discipline: 'RN' | 'LVN' | 'HHA';
  }>();
  const nurses = useQuery(api.nurses.searchNursesByFirstNameAndLastName, {
    name: query,
    todayToText,
    discipline,
  });
  if (nurses === undefined) {
    return <SmallLoader size={50} />;
  }

  const onAction = (discipline?: string) => {
    router.push(`/assign?discipline=${discipline}`);
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
