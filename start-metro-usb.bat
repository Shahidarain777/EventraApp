@echo off
echo ========================================
echo Starting Metro in USB debugging mode...
echo ========================================
echo.
echo This will make Metro work with USB-connected devices
echo Make sure your device is connected via USB with debugging enabled
echo.
echo Press Ctrl+C to stop Metro when done
echo.
npx react-native start --reset-cache --config metro.usb.config.js
