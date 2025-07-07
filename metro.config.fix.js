const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for React Native with improved connection settings
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    // This will make Metro available on all network interfaces
    // not just localhost - helpful for physical devices
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add CORS headers for bundle requests
        res.setHeader('Access-Control-Allow-Origin', '*');
        return middleware(req, res, next);
      };
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
