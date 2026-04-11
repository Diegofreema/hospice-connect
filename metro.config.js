// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { withUniwindConfig } = require('uniwind/metro');

/** @type {import('expo/metro-config').MetroConfig} */

const config = getDefaultConfig(__dirname);

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

module.exports = withUniwindConfig(config, {
  // relative path to your global.css file (from previous step)
  cssEntryFile: './global.css',
  // (optional) path where we gonna auto-generate typings
  // defaults to project's root
  dtsFile: './app/uniwind-types.d.ts',
});
