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
