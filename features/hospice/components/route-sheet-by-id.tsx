import { useHospice } from '@/components/context/hospice-context';
import { useMarkAsRead } from '@/features/hospice/hooks/use-mark-as-read';
import { RoustSheetComponent } from '@/features/shared/components/route-sheet-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Text } from '@/features/shared/components/text';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { ApproveRouteSheetModal } from './accept-notification';
import { DeclineRouteSheetModal } from './delcine-route-sheet';

export const RouteSheetById = () => {
  const { id, notificationId, isRead } = useLocalSearchParams<{
    id: Id<'routeSheets'>;
    notificationId: Id<'hospiceNotifications'>;
    isRead: string;
  }>();

  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);

  const { hospice } = useHospice();
  useMarkAsRead({ notificationId, isRead: isRead === 'true' });
  const data = useQuery(
    api.routeSheets.getRouteSheetById,
    hospice && hospice._id
      ? { hospiceId: hospice._id, routeSheetId: id }
      : 'skip',
  );

  if (data === undefined) {
    return <SmallLoader size={50} />;
  }
  const onClose = () => {
    setDeclineModalVisible(false);
  };

  const { assignment, nurse, routeSheet, schedules } = data;
  const isApproved = routeSheet.isApproved;
  const isSeen = !!routeSheet.isSeen;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <RoustSheetComponent
        date={routeSheet._creationTime}
        nurse={nurse}
        shifts={schedules}
        comment={routeSheet.comment!}
        signature={routeSheet.signature!}
        hospiceAddress={assignment.hospiceAddress}
        rate={assignment.rate}
        hospiceName={assignment.businessName}
        handleSubmit={() => setApproveModalVisible(true)}
        onGoBack={() => setDeclineModalVisible(true)}
        careLevel={data.assignment.careLevel}
        patientName={
          data.assignment.patientFirstName +
          ' ' +
          data.assignment.patientLastName
        }
        buttonText2="Approve"
        buttonText="Decline"
        hideButtons={isSeen}
        showDebit={false}
      />

      {isSeen && (
        <Text
          size={'medium'}
          style={{ marginTop: 10 }}
          color={isApproved ? 'green' : 'red'}
          isBold
          textAlign={'center'}
        >
          {isApproved ? 'Approved' : 'Declined'}
        </Text>
      )}
      <DeclineRouteSheetModal
        hospiceId={hospice?._id!}
        routeSheetId={data.routeSheet._id}
        onClose={onClose}
        visible={declineModalVisible}
        notificationId={notificationId}
      />
      <ApproveRouteSheetModal
        hospiceId={hospice?._id!}
        routeSheetId={data.routeSheet._id}
        visible={approveModalVisible}
        onClose={() => setApproveModalVisible(false)}
        notificationId={notificationId}
      />
    </ScrollView>
  );
};
