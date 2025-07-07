@echo off
echo ========================================
echo Building and installing the app...
echo ========================================
echo.
echo This will build and install the app on your USB-connected device
echo Make sure your device is connected via USB with debugging enabled
echo.
echo Press any key to continue...
pause > nul

cd android
call gradlew.bat clean
cd ..
npx react-native run-android
