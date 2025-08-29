/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResendOTP from "../ResendOTP.js";
import type * as ResendOTPPassword from "../ResendOTPPassword.js";
import type * as VerifyEmail from "../VerifyEmail.js";
import type * as auth from "../auth.js";
import type * as errors from "../errors.js";
import type * as helper from "../helper.js";
import type * as http from "../http.js";
import type * as nurses from "../nurses.js";
import type * as passwordReset_PasswordResetemail from "../passwordReset/PasswordResetemail.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  ResendOTPPassword: typeof ResendOTPPassword;
  VerifyEmail: typeof VerifyEmail;
  auth: typeof auth;
  errors: typeof errors;
  helper: typeof helper;
  http: typeof http;
  nurses: typeof nurses;
  "passwordReset/PasswordResetemail": typeof passwordReset_PasswordResetemail;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
