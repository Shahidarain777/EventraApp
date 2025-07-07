// scripts/postinstall.js
const fs = require("fs");
const path = require("path");

// These folders are expected by CMake during build
const dirs = [
  "node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni",
  "node_modules/react-native-gesture-handler/android/build/generated/source/codegen/jni"
];

// If they don't exist, create them
dirs.forEach((dir) => {
  const fullPath = path.resolve(__dirname, "..", dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created missing folder: ${fullPath}`);
  }
});
