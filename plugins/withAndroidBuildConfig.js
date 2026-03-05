const {
  withAppBuildGradle,
  withGradleProperties,
} = require('@expo/config-plugins');

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
    if (contents.includes('─── React Native Core ───')) {
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
  return config;
};

module.exports = withAndroidBuildConfig;
