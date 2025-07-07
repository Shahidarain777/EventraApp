// setup-device-debug.js
const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Get the computer's IP address on the local network
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback to localhost
}

const localIP = getLocalIP();
console.log(`\n🔍 Your local IP address is: ${localIP}\n`);

// Setup ADB reverse for both Metro and API server
try {
  console.log('🔄 Setting up ADB port forwarding...');
  execSync('adb reverse tcp:8081 tcp:8081', { stdio: 'inherit' });
  execSync('adb reverse tcp:3000 tcp:3000', { stdio: 'inherit' });
  console.log('✅ Port forwarding set up successfully!');
} catch (error) {
  console.error('❌ Failed to set up port forwarding. Is your device connected?');
  console.error(error.message);
}

// Create a script to run Metro with your IP address
const metroScript = `
@echo off
echo Starting Metro bundler for device at IP: ${localIP}
npx react-native start --host ${localIP}
`;

// Create a script to generate a development bundle
const bundleScript = `
@echo off
echo =====================================================
echo Creating a development bundle for reliable loading...
echo =====================================================
echo.
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
echo.
echo Bundle created! Now rebuild the app with:
echo npx react-native run-android
`;

const scriptPath = path.join(__dirname, 'start-metro-for-device.bat');
fs.writeFileSync(scriptPath, metroScript);
console.log(`✅ Created start script at: ${scriptPath}`);

const bundleScriptPath = path.join(__dirname, 'create-dev-bundle.bat');
fs.writeFileSync(bundleScriptPath, bundleScript);
console.log(`✅ Created bundle script at: ${bundleScriptPath}`);

console.log(`
🚀 Next steps to fix "Unable to load script" error:
1. Run the created bundle script: create-dev-bundle.bat
2. Once bundle is created, rebuild with: npx react-native run-android
3. If still having issues, try these steps:
   - Make sure USB debugging is enabled on your phone
   - In your phone's developer settings, set:
     Debug server host & port for device to: ${localIP}:8081
   - Run: adb reverse tcp:8081 tcp:8081
   - Start Metro with: start-metro-for-device.bat
`);
