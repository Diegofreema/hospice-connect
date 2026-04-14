import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import * as Progress from 'react-native-progress';
import { useDownloadOrPrint } from '../hooks/use-download';
import { generateRouteSheetHtml } from '../utils';
import { RoustSheetComponent } from './route-sheet-component';
import { SmallLoader } from './small-loader';
export const ViewRouteSheet = () => {
  const { assignmentId, nurseId } = useLocalSearchParams<{
    nurseId: Id<'nurses'>;
    assignmentId: Id<'assignments'>;
  }>();
  const data = useQuery(api.routeSheets.getRouteSheet, {
    nurseId,
    assignmentId,
  });
  const htmlContent = generateRouteSheetHtml(data);
  const { exportViewToPdf, loading, printToFile, progress } =
    useDownloadOrPrint({
      htmlContent,
    });

  if (data === undefined) {
    return <SmallLoader size={50} />;
  }
  const { assignment, nurse, routeSheet, schedules } = data;

  const onDownload = async () => {
    await exportViewToPdf();
  };
  const onPrint = async () => {
    await printToFile();
  };

  const hasSubmitted = !!routeSheet?._id;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <RoustSheetComponent
        nurse={nurse}
        date={routeSheet._creationTime}
        shifts={schedules}
        comment={routeSheet.comment!}
        signature={routeSheet.signature!}
        hospiceAddress={assignment.hospiceAddress}
        rate={assignment.rate}
        hospiceName={assignment.businessName}
        handleSubmit={onPrint}
        onGoBack={onDownload}
        careLevel={data.assignment.careLevel}
        patientName={
          data.assignment.patientFirstName +
          ' ' +
          data.assignment.patientLastName
        }
        buttonText2="Print"
        buttonText="Download"
        disabled2={loading}
        disabled={loading}
        showDebit={!hasSubmitted}
      />
      {progress > 0 && <Progress.Bar progress={progress} width={null} />}
    </ScrollView>
  );
};
