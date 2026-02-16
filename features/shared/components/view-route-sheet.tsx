import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import * as Progress from 'react-native-progress';
import { useDownloadOrPrint } from '../hooks/use-download';
import { calculateTotalHours, reverseDateStringToMDY } from '../utils';
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
  const htmlContent = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Route Sheet</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      background: #fff;
      color: #000;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .header-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .logo {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      display: block;
    }

    .text-center {
      text-align: center;
    }

    .text-bold {
      font-weight: bold;
    }

    .text-medium {
      font-size: 18px;
    }

    .text-small {
      font-size: 14px;
      color: #666;
    }

    .text-normal {
      font-size: 16px;
    }

    .flex-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #ddd;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    th {
      background-color: #f5f5f5;
      font-weight: bold;
      font-size: 14px;
    }

    td {
      font-size: 14px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .signature-section {
      border: 2px solid #000;
      padding: 20px;
      min-height: 100px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .signature-image {
      max-width: 200px;
      max-height: 80px;
      margin-bottom: 20px;
    }

    .comment-section {
      margin-top: 8px;
    }

    @media print {
      body {
        padding: 20px;
      }

      .container {
        gap: 24px;
      }

      .header-section {
        gap: 16px;
      }

      @page {
        margin: 1cm;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <div class="header-section">
      <img src="https://pastel-albatross-709.convex.cloud/api/storage/8c5eaabd-2b0a-41c1-8ad8-dfb01505fa19" alt="Hospice Logo" class="logo">
      <h1 class="text-center text-bold text-medium">${
        data?.assignment.businessName
      }</h1>
      <p class="text-center text-small">${data?.assignment.hospiceAddress}</p>
      <p class="text-center text-normal">Route Sheet</p>
      <div class="flex-text">
        <span>Staff Name: ${data?.nurse.name}</span>
        <span>Discipline: ${data?.nurse.discipline}</span>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Patient Name</th>
            <th>Care level</th>
            <th>Time in</th>
            <th>Time out</th>
            <th>Hours worked</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
           ${data?.schedules
             .map(
               (shift) => `
        <tr>
          <td> ${shift?.startDate} - ${shift?.endDate}</td>
          <td>${data?.assignment.patientFirstName} ${
            data?.assignment.patientLastName
          }</td>
          <td>${data?.assignment.careLevel}</td>
          <td>${reverseDateStringToMDY(shift.startTime)}</td>
          <td>${reverseDateStringToMDY(shift.endTime)}</td>
          <td>${calculateTotalHours([shift]).toFixed(2)}</td>
          <td>${data?.assignment.rate.toFixed(2)}</td>
          <td>$${(
            calculateTotalHours([shift]) * data?.assignment.rate || 0
          ).toFixed(2)}</td>
        </tr>
      `,
             )
             .join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals Section -->
    <div class="totals-row">
      <p class="text-medium text-bold">Total hours: ${calculateTotalHours(
        data?.schedules || [],
      ).toFixed(2)}</p>
      <p class="text-medium text-bold">Total pay: $${(
        Number(calculateTotalHours(data?.schedules || []).toFixed(2)) *
        (data?.assignment.rate || 0)
      ).toFixed(2)}</p>
    </div>

    <!-- Certification Text -->
    <p class="text-normal text-center">
      I certify the foregoing to be a correct accounting of time worked and services performed
    </p>

    <!-- Signature Section -->
    <div class="signature-section">
      <img src="${
        data?.routeSheet.signature
      }" class="signature-image" alt="Signature" width="200" height="100">
       <p class="text-normal"><strong>Date:</strong> ${
         data?.routeSheet &&
         format(data?.routeSheet._creationTime, 'MM/dd/yy HH:mm')
       }</p>
    </div>

    <!-- Comment Section -->
    <div class="comment-section">
      <p class="text-normal"><strong>Comment:</strong> ${
        data?.routeSheet.comment
      }</p>
    </div>
  </div>
</body>
</html>
  `;
  const { exportViewToPdf, loading, printToFile, progress, uri } =
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
  console.log(uri);

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
