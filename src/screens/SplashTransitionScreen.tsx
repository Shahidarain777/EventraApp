import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

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
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Animated.Image
          source={require('../../assets/EventraLogo.png')}
          style={{ width: 210, height: 210, marginBottom: 8, opacity, transform: [{ translateX }] }}
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
