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
      <Animated.Text
        style={[
          styles.eventraText,
          { transform: [{ translateX }], opacity },
        ]}
      >
        Eventra
      </Animated.Text>
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
  eventraText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
});
