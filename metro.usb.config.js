const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for React Native optimized for USB debugging
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    port: 8081,
    useGlobalHotkey: true,
    rewriteRequestUrl: (url) => {
      // Make sure the bundle URL works properly over USB
      if (url.startsWith('index.')) {
        return url;
      }
      if (url.startsWith('/index.android')) {
        return url;
      }
      return url;
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
