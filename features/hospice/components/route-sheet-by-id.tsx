import { useHospice } from '@/components/context/hospice-context';
import { useToast } from '@/components/demos/toast';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { RoustSheetComponent } from '@/features/shared/components/route-sheet-component';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { generateErrorMessage } from '@/features/shared/utils';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

export const RouteSheetById = () => {
  const { id } = useLocalSearchParams<{
    id: Id<'routeSheets'>;
  }>();
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();
  const { hospice } = useHospice();
  const approveOrDecline = useMutation(
    api.routeSheets.approveOrDeclineRouteSheet
  );
  const data = useQuery(
    api.routeSheets.getRouteSheetById,
    hospice && hospice._id
      ? { hospiceId: hospice._id, routeSheetId: id }
      : 'skip'
  );

  if (data === undefined) {
    return <SmallLoader size={50} />;
  }
  const onApprove = async () => {
    if (!hospice?._id) return;
    setProcessing(true);
    try {
      await approveOrDecline({
        routeSheetId: data.routeSheet._id,
        isApproved: true,
        hospiceId: hospice._id,
      });

      showToast({
        title: 'Success',
        subtitle: 'Route sheet approved successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to approve route sheet'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };
  const onDecline = async () => {
    if (!hospice?._id) return;
    setProcessing(true);
    try {
      await approveOrDecline({
        routeSheetId: data.routeSheet._id,
        isApproved: false,
        hospiceId: hospice._id,
      });

      showToast({
        title: 'Success',
        subtitle: 'Route sheet declined successfully',
        autodismiss: true,
      });
    } catch (error) {
      const errorMessage = generateErrorMessage(
        error,
        'Failed to decline route sheet'
      );
      showToast({
        title: 'Error',
        subtitle: errorMessage,
        autodismiss: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const { assignment, nurse, routeSheet, schedules } = data;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <RoustSheetComponent
        nurse={nurse}
        shifts={schedules}
        comment={routeSheet.comment!}
        signature={routeSheet.signature!}
        hospiceAddress={assignment.hospiceAddress}
        rate={assignment.rate}
        hospiceName={assignment.businessName}
        handleSubmit={onApprove}
        onGoBack={onDecline}
        careLevel={data.assignment.careLevel}
        patientName={
          data.assignment.patientFirstName +
          ' ' +
          data.assignment.patientLastName
        }
        buttonText2="Approve"
        buttonText="Decline"
        hideButtons={routeSheet.isApproved}
        disabled2={processing}
        disabled={processing}
        showDebit={false}
      />
    </ScrollView>
  );
};
