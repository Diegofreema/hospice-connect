// plugins/customPlugin.js
const fs = require("fs");
const {
  withPlugins,
  createRunOncePlugin,
  withDangerousMod,
  withPodfileProperties,
  withProjectBuildGradle,
  IOSConfig,
} = require("@expo/config-plugins");

// Inject Notifee Maven repo into android/build.gradle so Gradle can resolve app.notifee:core
// Notifee bundles its AAR locally inside the npm package — no remote Maven repo needed
const withNotifeeAndroidRepo = (config) => {
  return withProjectBuildGradle(config, (config) => {
    const notifeeRepo = `maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`;
    if (!config.modResults.contents.includes("notifee/react-native/android/libs")) {
      config.modResults.contents = config.modResults.contents.replace(
        `maven { url 'https://www.jitpack.io' }`,
        `maven { url 'https://www.jitpack.io' }\n    ${notifeeRepo}`
      );
    }
    return config;
  });
};

const modifyPodfile = (podfilePath) => {
  const preInstallBlock = `
  pre_install do |installer|
    installer.pod_targets.each do |pod|
      if pod.name.eql?('op-sqlite')
        def pod.build_type
          Pod::BuildType.static_library
        end
      end
    end
  end
`;

  const firebasePostInstallBlock = `
    # Firebase non-modular headers fix
    rnfb_targets = ['RNFBApp', 'RNFBAuth', 'RNFBCrashlytics', 'RNFBFirestore', 'RNFBFunctions', 'RNFBMessaging']
    installer.pods_project.targets.each do |target|
      if rnfb_targets.include?(target.name)
        target.build_configurations.each do |config|
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
          config.build_settings['DEFINES_MODULE'] = 'NO'
        end
      end
    end
`;

  if (fs.existsSync(podfilePath)) {
    let podfileContent = fs.readFileSync(podfilePath, "utf-8");

    // Look for the use_frameworks! line
    const useFrameworksLine =
      "use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']";

    if (podfileContent.includes(useFrameworksLine) && !podfileContent.includes("op-sqlite")) {
      // Insert the pre_install block just before the use_frameworks line
      podfileContent = podfileContent.replace(
        useFrameworksLine,
        preInstallBlock + "\n  " + useFrameworksLine,
      );
    }
    
    // Look for the post_install block
    const postInstallMarker = "post_install do |installer|";
    if (podfileContent.includes(postInstallMarker) && !podfileContent.includes("Firebase non-modular headers fix")) {
      // Append Firebase fix right after post_install do |installer|
      podfileContent = podfileContent.replace(
        postInstallMarker,
        postInstallMarker + "\n" + firebasePostInstallBlock
      );
    }

    fs.writeFileSync(podfilePath, podfileContent);
    console.log("CUSTOM MODIFY PODFILE PLUGIN: Podfile patched with fixes for op-sqlite and Firebase.");
  }
};

// we create a mod plugin here
const withModifyPodfile = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const path = IOSConfig.Paths.getPodfilePath(
        config.modRequest.projectRoot,
      );
      modifyPodfile(path);
      return config;
    },
  ]);
};

// this config plugin is only needed if we have expo-updates installed, reference: https://op-engineering.github.io/op-sqlite/docs/installation/#expo-updates
const withUseThirdPartySQLitePod = (expoConfig) => {
  return withPodfileProperties(expoConfig, (config) => {
    config.modResults = {
      ...config.modResults,
      "expo.updates.useThirdPartySQLitePod": "true",
    };
    return config;
  });
};

const withStreamOfflineMode = (config) => {
  return withPlugins(config, [
    withModifyPodfile,
    withUseThirdPartySQLitePod,
    withNotifeeAndroidRepo,
  ]);
};

module.exports = createRunOncePlugin(
  withStreamOfflineMode,
  "custom-modify-podfile-plugin",
  "0.0.1",
);
