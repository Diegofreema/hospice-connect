import { StreamChat } from 'stream-chat';

// Web stub — push notifications via FCM are not supported on web.
// Native platforms (iOS/Android) use use-register.native.ts instead.
export const useRegisterDevice = (
  _client: StreamChat | null,
  _userId: string,
) => {
  // no-op on web
};

