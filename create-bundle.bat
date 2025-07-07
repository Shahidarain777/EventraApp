@echo off
echo =====================================================
echo Creating a development bundle for reliable loading...
echo =====================================================
echo.
mkdir android\app\src\main\assets
npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res
echo.
echo Bundle created! Now rebuild the app with:
echo npx react-native run-android
