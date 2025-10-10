export type Role =
  | 'admin'
  | 'user'
  | 'guest'
  | 'anonymous'
  | 'channel_member'
  | 'channel_moderator'
  | (string & {});
export type TranslationLanguages =
  | 'af'
  | 'am'
  | 'ar'
  | 'az'
  | 'bg'
  | 'bn'
  | 'bs'
  | 'cs'
  | 'da'
  | 'de'
  | 'el'
  | 'en'
  | 'es'
  | 'es-MX'
  | 'et'
  | 'fa'
  | 'fa-AF'
  | 'fi'
  | 'fr'
  | 'fr-CA'
  | 'ha'
  | 'he'
  | 'hi'
  | 'hr'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ka'
  | 'ko'
  | 'lt'
  | 'lv'
  | 'ms'
  | 'nl'
  | 'no'
  | 'pl'
  | 'ps'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sl'
  | 'so'
  | 'sq'
  | 'sr'
  | 'sv'
  | 'sw'
  | 'ta'
  | 'th'
  | 'tl'
  | 'tr'
  | 'uk'
  | 'ur'
  | 'vi'
  | 'zh'
  | 'zh-TW'
  | (string & {});
export type PrivacySettings = {
  read_receipts?: {
    enabled?: boolean;
  };
  typing_indicators?: {
    enabled?: boolean;
  };
};
export type PushNotificationSettings = {
  disabled?: boolean;
  disabled_until?: string | null;
};
export type UserResponse = {
  id: string;
  anon?: boolean;
  banned?: boolean;
  blocked_user_ids?: string[];
  created_at?: string;
  deactivated_at?: string;
  deleted_at?: string;
  image?: string;
  language?: TranslationLanguages | '';
  last_active?: string;
  name?: string;
  notifications_muted?: boolean;
  online?: boolean;
  privacy_settings?: PrivacySettings;
  push_notifications?: PushNotificationSettings;
  revoke_tokens_issued_before?: string;
  role?: string;
  shadow_banned?: boolean;
  teams?: string[];
  teams_role?: TeamsRole;
  updated_at?: string;
  username?: string;
  avg_response_time?: number;
};
export type InviteStatus = 'pending' | 'accepted' | 'rejected';
export type ChannelMemberResponse = {
  archived_at?: string | null;
  ban_expires?: string;
  banned?: boolean;
  channel_role?: Role;
  created_at?: string;
  invite_accepted_at?: string;
  invite_rejected_at?: string;
  invited?: boolean;
  is_moderator?: boolean;
  notifications_muted?: boolean;
  pinned_at?: string | null;
  role?: string;
  shadow_banned?: boolean;
  status?: InviteStatus;
  updated_at?: string;
  user?: UserResponse;
  user_id?: string;
};
export type TeamsRole = {
  [team: string]: string;
};
