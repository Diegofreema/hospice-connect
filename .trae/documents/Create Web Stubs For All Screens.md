I will add `.web.tsx` files for every existing screen under `app/` that currently only has `.tsx` so the web variant returns a minimal `<div />` and avoids importing native-only libraries.

Scope:
- (protected)/(boarded)/(hospice)/(other-screens): add `.web.tsx` for all `.tsx` files, including dynamic `[id].tsx`.
- (protected)/(boarded)/(hospice)/(tabs): add `.web.tsx` for `create.tsx`, `index.tsx`, `more.tsx`, `posts.tsx`.
- (protected)/(boarded)/(nurse)/(other-screens): add `.web.tsx` for each screen.
- (protected)/(boarded)/(nurse)/(tabs): add `.web.tsx` for `index.tsx`, `more.tsx` (message already has web).
- (protected) root: add `.web.tsx` for `privacy.tsx`, `reset-password.tsx`, `support.tsx`.
- (not-boarded): add `.web.tsx` stubs for `hospice-create.tsx`, `nurse-create.tsx`, `select-account.tsx`.
- (public): add `.web.tsx` stubs for all `.tsx` screens.

Each stub will be:
```tsx
import React from 'react';
export default function Screen() { return <div />; }
```

After changes, web SSR/build will resolve `.web.tsx` and avoid native-only imports, returning a simple div as requested.