import { api } from '@/convex/_generated/api';
import { FunctionReturnType } from 'convex/server';

export type ActivityNotification = FunctionReturnType<
  typeof api.adminActivityNotifications.getAdminActivityNotifications
>['page'][number];
