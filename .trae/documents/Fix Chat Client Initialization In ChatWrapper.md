## Diagnosis

* `useCreateChatClient` returns `undefined` when required inputs are missing or invalid.

* Current code uses non-null assertions (`user?.id!`, `user?.name!`, `user?.image!`) that can pass `undefined` at runtime if `user` is not hydrated yet.

* `tokenOrProvider` is set to `user?.streamToken`; if this is `undefined` initially (or mismatched to the API key), client creation is skipped.

* `chatApiKey` from `chat-config.ts` must match the backend that issues the Stream token; a mismatch prevents connection.

## Proposed Changes

1. **Gate Client Creation on Valid Inputs**

* Do not construct the client until all are present: `user.id`, `user.name`, `user.streamToken`, and a defined `chatApiKey`.

* Replace non-null assertions with explicit guards.

1. **Stable** **`userData`** **via** **`useMemo`**

* Build `userData` only when `user` fields exist to avoid recreations and accidental `undefined` values:

```ts
const userData = useMemo(() => (
  user?.id && user?.name
    ? { id: user.id, name: user.name, image: user.image ?? undefined }
    : undefined
), [user?.id, user?.name, user?.image]);
```

1. **Use Token Provider Function**

* Pass a provider function that returns the token when available:

```ts
const tokenProvider = useCallback(async () => {
  if (!user?.streamToken) throw new Error('Missing stream token');
  return user.streamToken;
}, [user?.streamToken]);
```

* Instantiate the client only when both `userData` and `tokenProvider` are ready:

```ts
const chatClient = useCreateChatClient(
  userData && chatApiKey ? { apiKey: chatApiKey, userData, tokenOrProvider: tokenProvider } : undefined
);
```

1. **Guard Rendering & Sign-out Logic**

* Early return `LoadingComponent` until `userData` and `user.streamToken` exist.

* Keep the sign-out effect, but only trigger after Auth is loaded and token is confirmed missing.

1. **Align API Key With Token Backend**

* Ensure `chatApiKey` in `chat-config.ts` matches the key used by the token issuer (`/api/token`). If they differ, update `chatApiKey` or the issuer.

1. **Robust Unread Count & Event Listener**

* Wrap `getUnreadCount` in try/catch to avoid crashes if the client reconnects.

* Keep the listener cleanup as-is; it’s correct.

## Verification

* Log readiness states (`apiKey`, `userData`, `streamToken`) before client creation.

* Confirm `chatClient` becomes defined and `getUnreadCount` returns a number.

* Validate that messaging works (`client.channel(...).watch`) in `use-message.ts`.

* Test with a user who has a valid `streamToken` and with a user missing the token (should render loading, then sign out).

## Notes

* No server changes are required if `/api/token` already issues tokens for the same `chatApiKey`.

* If you prefer, I can switch to manual `StreamChat.getInstance(apiKey)` + `connectUser(userData, token)` for full control, but the hook should work once inputs are gated.

