'use client';

import { Card, CardContent } from '@/components/web/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/web/ui/tabs';
import { api } from '@/convex/_generated/api';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/web/ui/button';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { Clock } from 'lucide-react-native';
import { Loader } from '../shared/loader';
import { UpdateDetailsDialog } from './update-detail-dialog';
import { UpdateList } from './update-list';

export function ProfileUpdates() {
  const [selectedNurseUpdateId, setSelectedNurseUpdateId] = useState<
    Id<'pendingNurseProfile'> | undefined
  >();
  const [selectedHospiceUpdateId, setSelectedHospiceUpdateId] = useState<
    Id<'pendingHospiceProfile'> | undefined
  >();
  const [showNurseDialog, setShowNurseDialog] = useState(false);
  const [showHospiceDialog, setShowHospiceDialog] = useState(false);

  const getTotalPendingProfileUpdate = useQuery(
    api.profileUpdates.getTotalPendingProfileUpdate,
  );

  const {
    results: pendingNurseUpdates,
    loadMore: loadMoreNurseUpdates,
    status: pendingNurseUpdatesStatus,
  } = usePaginatedQuery(
    api.profileUpdates.getPendingNurseUpdates,
    {},
    { initialNumItems: 20 },
  );
  const {
    results: pendingHospiceUpdates,
    loadMore: loadMoreHospiceUpdates,
    status: pendingHospiceUpdatesStatus,
  } = usePaginatedQuery(
    api.profileUpdates.getPendingHospiceUpdates,
    {},
    { initialNumItems: 20 },
  );
  const handleSelectNurseUpdate = useCallback(
    (update: Doc<'pendingNurseProfile'> | Doc<'pendingHospiceProfile'>) => {
      setSelectedNurseUpdateId(update._id as Id<'pendingNurseProfile'>);
      setShowNurseDialog(true);
    },
    [],
  );

  const handleSelectHospiceUpdate = useCallback(
    (update: Doc<'pendingNurseProfile'> | Doc<'pendingHospiceProfile'>) => {
      setSelectedHospiceUpdateId(update._id as Id<'pendingHospiceProfile'>);
      setShowHospiceDialog(true);
    },
    [],
  );

  const handleApprovalComplete = useCallback(async () => {}, []);

  if (
    getTotalPendingProfileUpdate === undefined ||
    pendingHospiceUpdatesStatus === 'LoadingFirstPage' ||
    pendingNurseUpdatesStatus === 'LoadingFirstPage'
  ) {
    return <Loader message="Loading profile updates" />;
  }

  const totalPending =
    getTotalPendingProfileUpdate?.nursePending +
    getTotalPendingProfileUpdate?.hospicePending;
  const pendingNurse = getTotalPendingProfileUpdate?.nursePending;
  const pendingHospice = getTotalPendingProfileUpdate?.hospicePending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Profile Update Approvals
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and approve pending profile updates from healthcare
          professionals and hospices
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-3xl font-bold">{totalPending}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Nurse and Hospice Updates */}
      <Tabs defaultValue="nurses" className="w-full">
        <TabsList>
          <TabsTrigger value="nurses">
            Healthcare Professional Updates ({pendingNurse})
          </TabsTrigger>
          <TabsTrigger value="hospices">
            Hospice Updates ({pendingHospice})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nurses" className="space-y-4">
          <UpdateList
            updates={pendingNurseUpdates || []}
            type="nurse"
            onSelectUpdate={handleSelectNurseUpdate}
            isLoading={pendingNurseUpdates === undefined}
          />
        </TabsContent>

        <TabsContent value="hospices" className="space-y-4">
          <UpdateList
            updates={pendingHospiceUpdates || []}
            type="hospice"
            onSelectUpdate={handleSelectHospiceUpdate}
            isLoading={pendingHospiceUpdates === undefined}
          />
        </TabsContent>
      </Tabs>

      {pendingNurseUpdatesStatus === 'CanLoadMore' && (
        <Button onClick={() => loadMoreNurseUpdates(10)}>Load More</Button>
      )}
      {pendingHospiceUpdatesStatus === 'CanLoadMore' && (
        <Button onClick={() => loadMoreHospiceUpdates(10)}>Load More</Button>
      )}

      {/* Nurse Update Details Dialog */}
      <UpdateDetailsDialog
        isOpen={showNurseDialog}
        onOpenChange={setShowNurseDialog}
        updateIdNurse={selectedNurseUpdateId as Id<'pendingNurseProfile'>}
        type="nurse"
        onApprovalComplete={handleApprovalComplete}
      />

      {/* Hospice Update Details Dialog */}
      <UpdateDetailsDialog
        isOpen={showHospiceDialog}
        onOpenChange={setShowHospiceDialog}
        updateIdHospice={selectedHospiceUpdateId as Id<'pendingHospiceProfile'>}
        type="hospice"
        onApprovalComplete={handleApprovalComplete}
      />
    </div>
  );
}
