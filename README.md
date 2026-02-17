# HospiceConnect

Cross‑platform mobile app built with Expo (React Native + TypeScript) for hospice care coordination. The project integrates Convex (serverless backend), Better Auth, and other native capabilities, and is set up for EAS build and updates.

> Last updated: 2026‑02‑16 23:50 local time

## Stack Overview

- Language: TypeScript
- Runtime: React Native via Expo SDK 54
- App Router: `expo-router` (file‑based routing in `app/`)
- Backend: Convex (`convex/` directory, cloud URLs consumed from env)
- Auth: `better-auth` with Google OAuth (via `@auth/core`)
- State & UI:
  - UI libs: Radix UI (web), `@expo/ui`, `lucide-react-native`, `@tabler/icons-react-native`
  - State: `zustand`
  - Forms: `react-hook-form` + `zod`
  - Styling: Tailwind CSS 4 + `react-native-unistyles`
- Payments: `@stripe/stripe-react-native`
- Chat: `stream-chat-expo` (present in deps)
- Build & OTA: EAS (`eas.json`) and `expo-updates`
- Package manager: Bun lockfile (`bun.lockb`) present. Scripts are standard npm scripts and work with Bun/Yarn as well.
- Entry point: `index.ts` (declared as `main` in `package.json`)

## Requirements

- Node.js 18+ (recommended for Expo SDK 54)
- Bun 1.x OR npm 9+ (choose one)
- Expo CLI (installed automatically via npx/bunx) and EAS CLI for builds
- iOS: Xcode + iOS Simulator
- Android: Android Studio + SDK/emulator

## Getting Started

1. Clone and install dependencies
   - With Bun
     ```bash
     bun install
     ```
   - With npm
     ```bash
     npm install
     ```

2. Configure environment variables (see Env Vars section). For local dev, you can use a `.env` or `.env.local` with Expo (see notes below).

3. Start the app (Metro bundler)
   - With Bun
     ```bash
     bun run start
     # or
     bunx expo start
     ```
   - With npm
     ```bash
     npm run start
     # or
     npx expo start
     ```

4. Open on device/simulator from the Expo DevTools:
   - Development build
   - Android emulator
   - iOS simulator
   - Expo Go (limited)

## Scripts

From `package.json`:

- `start` — Start Metro/Expo dev server (`expo start`)
- `ios` — Run on iOS (`expo run:ios`)
- `android` — Run on Android (`expo run:android`)
- `web` — Start web target (`expo start --web`)
- `prebuild` — Generate native iOS/Android projects
- `build:dev` — EAS build with `development` profile
- `build:preview` — EAS build with `preview` profile
- `build:prod` — EAS build with `production` profile
- `update:preview` — EAS update to `preview` branch (OTA)
- `update:prod` — EAS update to `production` branch (OTA)
- `lint` — Run ESLint and Prettier (check only)
- `format` — ESLint fix and Prettier write

Use with your package manager, e.g. `bun run build:dev` or `npm run build:dev`.

## Environment Variables

The project reads configuration from environment variables. Public variables prefixed with `EXPO_PUBLIC_` are embedded into the app bundle by Expo and must be safe for clients. Private secrets should never use `EXPO_PUBLIC_` and must only be used server‑side (e.g., inside Convex functions or secure backends).

Detected usages:

- Client/public
  - `EXPO_PUBLIC_CONVEX_URL` — Convex deployment URL used by the client (see `components/provider.tsx`).
  - `EXPO_PUBLIC_CONVEX_SITE_URL` — Convex site URL (see `lib/auth-client.ts`).
  - `EXPO_PUBLIC_CHAT_API_KEY` — Chat API key (see `chat-config.ts`).
  - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (see `features/nurse/components/billings.tsx`).
  - `EXPO_PUBLIC_SITE_URL` — Site URL constant (see `lib/constants.ts`).

- Server/private (Convex, auth, email)
  - `SITE_URL` — App/site URL for auth flows (see `convex/auth.ts`).
  - `NATIVE_APP_URL` — Native deep link base, defaults to `hospice-connect://` (see `convex/auth.ts`).
  - `AUTH_GOOGLE_ID` — Google OAuth client ID (see `convex/auth.ts`).
  - `AUTH_GOOGLE_SECRET` — Google OAuth client secret (see `convex/auth.ts`).
  - `RESEND_API_KEY` — Resend API key for emails (see `convex/sendEmail.tsx`).
  - `RESEND_WEBHOOK_SECRET` — Resend webhook secret (see `convex/sendEmail.tsx`).

Expo/EAS environment configuration:

- For local development, you can define public vars in `app.config.js`/`app.json` via the `expo.extra` or rely on `.env` files with `expo-env` plugins. This repo includes `expo-env.d.ts`, suggesting typed env usage.
- The `eas.json` contains example values for preview builds:
  ```json
  {
    "env": {
      "EXPO_PUBLIC_CONVEX_URL": "https://pastel-albatross-709.convex.cloud",
      "EXPO_PUBLIC_CONVEX_SITE_URL": "https://pastel-albatross-709.convex.site",
      "EXPO_PUBLIC_CHAT_API_KEY": "jeagup93jged"
    }
  }
  ```

TODOs:
- Add documentation for managing secrets in Convex (e.g., `npx convex env set`).
- Confirm whether `.env` files are used with a specific plugin and document expected locations.
- Provide Stripe key setup guidance and deep link schemes for `NATIVE_APP_URL`.

## Building and Updates (EAS)

- Install EAS CLI if not present:
  ```bash
  bunx eas-cli --version  # or: npm i -g eas-cli
  ```
- Authenticate and configure:
  ```bash
  eas login
  eas build:configure
  ```
- Build:
  ```bash
  bun run build:dev       # dev
  bun run build:preview   # preview
  bun run build:prod      # production
  ```
- OTA Updates:
  ```bash
  bun run update:preview -m "Your message"
  bun run update:prod -m "Your message"
  ```

## Project Structure

Top‑level directories/files:

- `app/` — Screens and routes (Expo Router, file‑based)
- `components/` — Shared UI components
- `features/` — Feature‑scoped components and logic (e.g., nurse billing)
- `convex/` — Convex backend schema, server functions, auth, email
- `lib/` — Client libs/utilities (e.g., auth client, constants)
- `hooks/` — React hooks
- `assets/` — Images, fonts, lottie, etc.
- `theme.ts`, `unistyles.ts`, `global.css` — Theming and styles
- `tailwind.config.js` — Tailwind config
- `eas.json` — EAS build profiles and env
- `app.json` — Expo app config
- `index.ts` — App entry point specified in `package.json#main`
- `android/`, `ios/` — Native projects (after prebuild)
- `scripts/` — Project scripts (if any)
- `bun.lockb` — Bun lockfile (indicates Bun is in use)

## Running on iOS/Android

- iOS Simulator
  ```bash
  bun run ios
  # or
  npm run ios
  ```
- Android Emulator
  ```bash
  bun run android
  # or
  npm run android
  ```

If native projects are missing or outdated, run `bun run prebuild` (or `npm run prebuild`).

## Testing

Currently, there is no test setup detected in the repository (no Jest/Vitest config or test files found).

TODOs:
- Decide on a test framework (Jest for RN + React Testing Library, or Vitest for web targets) and add a `test` script.
- Add unit tests for utilities and components and basic E2E (Detox) if required.

## Linting & Formatting

- Lint:
  ```bash
  bun run lint
  # or
  npm run lint
  ```
- Format:
  ```bash
  bun run format
  # or
  npm run format
  ```

## Troubleshooting

- If env vars fail to load on client, ensure they are prefixed with `EXPO_PUBLIC_` and provided via EAS or app config.
- For Convex connectivity, verify `EXPO_PUBLIC_CONVEX_URL` and that the deployment is reachable.
- If iOS/Android builds fail after dependency changes, try `expo prebuild` to regenerate native projects.

## Learn More

- Expo docs: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- EAS Build/Update: https://docs.expo.dev/build/introduction/ and https://docs.expo.dev/eas-update/introduction/
- Convex: https://docs.convex.dev/
- Stripe React Native: https://stripe.com/docs/payments/accept-a-payment?platform=react-native

## License

No license file detected.

TODO: Add a `LICENSE` file (e.g., MIT, Apache 2.0) and update this section accordingly.
