import React, { useEffect, useRef } from 'react';
import { View,StatusBar, Text, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function SplashTransitionScreen({ navigation }: any) {
  const translateX = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 1400);
    return () => clearTimeout(timeout);
  }, [navigation, translateX, opacity]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor="#075cf8" />
      <LinearGradient colors={["#075cf8", "#2876f4"]} style={StyleSheet.absoluteFill} />
      <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
        <Animated.Image
          source={require('../../assets/EventraLogo.png')}
          style={{ width: 210, height: 210, opacity, transform: [{ translateX }] }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075cf8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
