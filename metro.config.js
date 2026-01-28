// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

// Platform-specific module resolution to exclude mobile folders from web builds
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Exclude (protected) and (public) route folders from web builds
  if (platform === 'web') {
    const isProtectedRoute =
      moduleName.includes('app/(protected)') ||
      moduleName.includes('app/(public)');

    if (isProtectedRoute) {
      // Return a minimal empty module to prevent bundling
      return {
        type: 'empty',
      };
    }
  }

  // Use default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
