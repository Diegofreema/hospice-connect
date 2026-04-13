/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as actionHelper from "../actionHelper.js";
import type * as activityLogs from "../activityLogs.js";
import type * as adminActivityNotifications from "../adminActivityNotifications.js";
import type * as adminAssignment from "../adminAssignment.js";
import type * as adminHospices from "../adminHospices.js";
import type * as adminNurses from "../adminNurses.js";
import type * as adminRouteSheets from "../adminRouteSheets.js";
import type * as adminSettings from "../adminSettings.js";
import type * as assignments from "../assignments.js";
import type * as auth from "../auth.js";
import type * as counter from "../counter.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as deleteAccount from "../deleteAccount.js";
import type * as emails_ResetPasswordEmail from "../emails/ResetPasswordEmail.js";
import type * as emails_VerifyEmail from "../emails/VerifyEmail.js";
import type * as handleEvent from "../handleEvent.js";
import type * as healthCheck from "../healthCheck.js";
import type * as helper from "../helper.js";
import type * as hospiceNotification from "../hospiceNotification.js";
import type * as hospices from "../hospices.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as nurseCommission from "../nurseCommission.js";
import type * as nurseCommissionHelpers from "../nurseCommissionHelpers.js";
import type * as nurseNotifications from "../nurseNotifications.js";
import type * as nursePayments from "../nursePayments.js";
import type * as nursePaymentsActions from "../nursePaymentsActions.js";
import type * as nurses from "../nurses.js";
import type * as passwordReset_PasswordResetemail from "../passwordReset/PasswordResetemail.js";
import type * as posts from "../posts.js";
import type * as privateData from "../privateData.js";
import type * as profileUpdates from "../profileUpdates.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as routeSheets from "../routeSheets.js";
import type * as routeSheetsActions from "../routeSheetsActions.js";
import type * as routeSheetsHelpers from "../routeSheetsHelpers.js";
import type * as schedules from "../schedules.js";
import type * as sendEmail from "../sendEmail.js";
import type * as shifts from "../shifts.js";
import type * as streamToken from "../streamToken.js";
import type * as stripeHelper from "../stripeHelper.js";
import type * as support from "../support.js";
import type * as types from "../types.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  actionHelper: typeof actionHelper;
  activityLogs: typeof activityLogs;
  adminActivityNotifications: typeof adminActivityNotifications;
  adminAssignment: typeof adminAssignment;
  adminHospices: typeof adminHospices;
  adminNurses: typeof adminNurses;
  adminRouteSheets: typeof adminRouteSheets;
  adminSettings: typeof adminSettings;
  assignments: typeof assignments;
  auth: typeof auth;
  counter: typeof counter;
  crons: typeof crons;
  dashboard: typeof dashboard;
  deleteAccount: typeof deleteAccount;
  "emails/ResetPasswordEmail": typeof emails_ResetPasswordEmail;
  "emails/VerifyEmail": typeof emails_VerifyEmail;
  handleEvent: typeof handleEvent;
  healthCheck: typeof healthCheck;
  helper: typeof helper;
  hospiceNotification: typeof hospiceNotification;
  hospices: typeof hospices;
  http: typeof http;
  notifications: typeof notifications;
  nurseCommission: typeof nurseCommission;
  nurseCommissionHelpers: typeof nurseCommissionHelpers;
  nurseNotifications: typeof nurseNotifications;
  nursePayments: typeof nursePayments;
  nursePaymentsActions: typeof nursePaymentsActions;
  nurses: typeof nurses;
  "passwordReset/PasswordResetemail": typeof passwordReset_PasswordResetemail;
  posts: typeof posts;
  privateData: typeof privateData;
  profileUpdates: typeof profileUpdates;
  pushNotifications: typeof pushNotifications;
  routeSheets: typeof routeSheets;
  routeSheetsActions: typeof routeSheetsActions;
  routeSheetsHelpers: typeof routeSheetsHelpers;
  schedules: typeof schedules;
  sendEmail: typeof sendEmail;
  shifts: typeof shifts;
  streamToken: typeof streamToken;
  stripeHelper: typeof stripeHelper;
  support: typeof support;
  types: typeof types;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
  shardedCounter: import("@convex-dev/sharded-counter/_generated/component.js").ComponentApi<"shardedCounter">;
  crons: import("@convex-dev/crons/_generated/component.js").ComponentApi<"crons">;
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  pushNotifications: import("@convex-dev/expo-push-notifications/_generated/component.js").ComponentApi<"pushNotifications">;
};
