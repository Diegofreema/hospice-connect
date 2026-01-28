Root cause:

* The web build runs server-side rendering for Expo Router, so code evaluates in a Node environment where `window` is undefined.

* `stream-chat-expo` references `window` at module load. Any static `import 'stream-chat-expo'` causes SSR to crash.

Plan:

1. Split chat code by platform.

   * Create `components/chat-wrapper.native.tsx` containing the current implementation that imports `stream-chat-expo`.

   * Create `components/chat-wrapper.web.tsx` that avoids importing `stream-chat-expo` and either renders children as-is or shows a small “Chat not supported on web yet” message. Optionally later, integrate `stream-chat-react` for web.
2. Update screens/components that import `stream-chat-expo` directly:

   * `app/(protected)/(boarded)/channel/[id].tsx` and other messaging screens under features/messaging: create `.native.tsx` files with current content and `.web.tsx` stubs without `stream-chat-expo` imports.

   * Keep import paths identical; Metro will resolve `.web.tsx` on web, `.native.tsx` on iOS/Android.
3. Verify web build:

   * Run the web dev server; confirm SSR no longer attempts to import `stream-chat-expo` and the error disappears.

   * Verify native builds still function.

Notes:

* This keeps chat working on native and prevents SSR from loading modules that require `window`.

* No behavioral changes outside web; web can get a placeholder until a proper web chat implementation is added.

