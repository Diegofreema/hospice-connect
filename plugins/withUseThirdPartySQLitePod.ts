import type { ConfigPlugin } from '@expo/config-plugins';
import { withPodfileProperties } from '@expo/config-plugins';

const withUseThirdPartySQLitePod: ConfigPlugin<never> = (expoConfig) => {
  return withPodfileProperties(expoConfig, (config) => {
    config.modResults = {
      ...config.modResults,
      'expo.updates.useThirdPartySQLitePod': 'true',
    };
    return config;
  });
};

export default withUseThirdPartySQLitePod;
