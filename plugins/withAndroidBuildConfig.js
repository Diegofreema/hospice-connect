const {
  withAppBuildGradle,
  withGradleProperties,
  withAndroidManifest,
} = require('@expo/config-plugins');

/**
 * Adds android:largeHeap="true" to the <application> element.
 * This gives the app a larger memory heap, making Android less likely
 * to kill the process when it goes to background for native API calls
 * (file picker, camera, clipboard).
 */
const withLargeHeap = (config) => {
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:largeHeap'] = 'true';
    }
    return mod;
  });
};

/**
 * Disables lint abort-on-error and release lint checks.
 * The LintDriver crashes with Kotlin 2.1.20 — this prevents it from
 * breaking the release build until the upstream bug is resolved.
 */
const withLintConfig = (config) => {
  return withAppBuildGradle(config, (mod) => {
    const contents = mod.modResults.contents;
    if (contents.includes('abortOnError false')) return mod; // idempotent
    mod.modResults.contents = contents.replace(/lint\s*\{[^}]*\}/s, '');
    // Append lint block before the closing brace of the android block
    mod.modResults.contents = mod.modResults.contents.replace(
      /(androidResources\s*\{[^}]*\})(\s*\})/s,
      (_, androidResources, closingBrace) =>
        `${androidResources}
    lint {
        abortOnError false
        checkReleaseBuilds false
    }${closingBrace}`,
    );
    return mod;
  });
};

/**
 * The full set of configChanges that prevents Android from destroying
 * MainActivity when opening external activities (gallery, file picker, camera).
 * Without these, Android recreates the activity and the app resets to the home screen.
 */
const FULL_CONFIG_CHANGES =
  'keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|mnc|locale|layoutDirection|fontScale|smallestScreenSize|density';

/**
 * Sets android:configChanges on MainActivity to the full list.
 * This is the native fix for the "app resets when gallery opens" bug on Android.
 */
const withMainActivityConfigChanges = (config) => {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
    const mainActivity = manifest.manifest.application?.[0]?.activity?.find(
      (a) => a.$['android:name'] === '.MainActivity',
    );
    if (mainActivity) {
      mainActivity.$['android:configChanges'] = FULL_CONFIG_CHANGES;
    }
    return mod;
  });
};

/**
 * Custom Expo config plugin that:
 * 1. Appends comprehensive ProGuard keep rules for all native modules
 * 2. Increases the Gradle JVM heap to 4GB to prevent OOM during R8/ProGuard
 *
 * This is needed because the `/android` folder is in `.easignore`, so EAS
 * regenerates it via `expo prebuild`. Changes to `android/` files are ignored
 * by EAS — they must be applied via config plugins like this one.
 */

const PROGUARD_RULES = `
# ─── React Native Core ───────────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# ─── React Native Reanimated + Worklets ──────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }

# ─── Expo Modules ─────────────────────────────────────────────────────────────
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# ─── op-sqlite ────────────────────────────────────────────────────────────────
-keep class com.op.sqlite.** { *; }

# ─── RevenueCat ───────────────────────────────────────────────────────────────
-keep class com.revenuecat.purchases.** { *; }

# ─── Stripe React Native ──────────────────────────────────────────────────────
-keep class com.reactnativestripesdk.** { *; }
# Suppress missing optional push provisioning classes (not used in this app)
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivity$g
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Args
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Error
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningEphemeralKeyProvider

# ─── Stream Chat ──────────────────────────────────────────────────────────────
-keep class io.getstream.** { *; }

# ─── Gesture Handler ──────────────────────────────────────────────────────────
-keep class com.swmansion.gesturehandler.** { *; }

# ─── React Native Screens ─────────────────────────────────────────────────────
-keep class com.swmansion.rnscreens.** { *; }

# ─── Lottie ───────────────────────────────────────────────────────────────────
-keep class com.airbnb.lottie.** { *; }

# ─── Nitro Modules ────────────────────────────────────────────────────────────
-keep class com.margelo.nitro.** { *; }

# ─── Safe Area Context ────────────────────────────────────────────────────────
-keep class com.th3rdwave.safeareacontext.** { *; }

# ─── AsyncStorage ─────────────────────────────────────────────────────────────
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ─── Image Picker ─────────────────────────────────────────────────────────────
-keep class com.imagepicker.** { *; }

# ─── New Architecture / TurboModules ─────────────────────────────────────────
-keep class com.facebook.react.turbomodule.** { *; }
-keep @com.facebook.react.bridge.annotations.ReactModule class * { *; }

# ─── Kotlin ───────────────────────────────────────────────────────────────────
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**
`;

/** Append ProGuard rules to the app's proguard-rules.pro via build.gradle */
const withProguardRules = (config) => {
  return withAppBuildGradle(config, (mod) => {
    const contents = mod.modResults.contents;

    // Only add once
    if (contents.includes('extra-proguard-rules.pro')) {
      return mod;
    }

    // Inject a task that writes our extra rules file and wires it into proguardFiles
    const injection = `
// ─── Custom ProGuard rules injected by withAndroidBuildConfig plugin ───────
android.buildTypes.release {
    proguardFile "$rootDir/../plugins/extra-proguard-rules.pro"
}
`;
    mod.modResults.contents = contents + injection;
    return mod;
  });
};

/** Increase Gradle JVM heap to avoid OOM during R8 */
const withGradleJvmArgs = (config) => {
  return withGradleProperties(config, (mod) => {
    const props = mod.modResults;
    const jvmKey = 'org.gradle.jvmargs';

    // Remove the existing entry (if any)
    const filtered = props.filter(
      (item) => !(item.type === 'property' && item.key === jvmKey),
    );

    // Add our value
    filtered.push({
      type: 'property',
      key: jvmKey,
      value:
        '-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError',
    });

    mod.modResults = filtered;
    return mod;
  });
};

const withAndroidBuildConfig = (config) => {
  config = withGradleJvmArgs(config);
  config = withMainActivityConfigChanges(config);
  config = withLargeHeap(config);
  config = withLintConfig(config);
  config = withProguardRules(config);
  return config;
};

module.exports = withAndroidBuildConfig;
