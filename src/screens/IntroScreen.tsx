import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function IntroScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#075cf8" />
      <LinearGradient 
        colors={["#075cf8", "#2876f4"]} 
        style={styles.gradient}
      >
        <SafeAreaView style={{ flex: 1 }}>
  

          <View style={styles.header}>
            <Text style={styles.title}>
              <Text style={{color:'#fff'}}>Create, </Text>
              <Text style={{color:'#FFD700'}}>Join</Text>
              <Text style={{color:'#fff'}}> & </Text>
              <Text style={{color:'#FF69B4'}}>Discover</Text>
              <Text style={{color:'#fff'}}> Events Anywhere</Text>
            </Text>
          </View>
            <View style={styles.illustrationWrapper}>
              <Image
                source={require('../../assets/eventra_illustration.png')}
                style={styles.illustration}
              />
            </View>
          <TouchableOpacity style={styles.getStarted} activeOpacity={0.85} onPress={() => navigation.replace('SplashTransition')}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
          <View style={styles.subtitleBelowContainer}>
            <Text style={styles.subtitleBelow}>Find, create, and join amazing events near you. Connect with people, share moments, and never miss out!</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  
  header: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
    lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 8,
  },

  subtitleBelowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  subtitleBelow: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '400',
    letterSpacing: 0.2,
    paddingHorizontal: 32,
    lineHeight: 24,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 56,
  },
  illustration: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'contain',
    borderRadius: 32,
  },
  getStarted: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#222',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 54,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
    transform: [{ scale: 1.04 }],
  },
  getStartedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
