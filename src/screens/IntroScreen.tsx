import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function IntroScreen({ navigation }: any) {
  return (
    <LinearGradient colors={["#4F8CFF", "#A6C8FF"]} style={styles.container}>
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
        <View style={styles.cardsRowWrapper}>
          <View style={styles.cardsRowAnimated}>
            <Image source={require('../../assets/intro_card1.jpg')} style={[styles.card, styles.cardLeft]} />
            <Image source={require('../../assets/intro_card2.jpg')} style={[styles.card, styles.cardRight]} />
          </View>
        </View>
        <TouchableOpacity style={styles.getStarted} activeOpacity={0.85} onPress={() => navigation.replace('SplashTransition')}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
        <View style={styles.subtitleBelowContainer}>
          <Text style={styles.subtitleBelow}>Find, create, and join amazing events near you. Connect with people, share moments, and never miss out!</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 60,
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
  subtitle: {
    fontSize: 16,
    color: '#e6e6e6',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'System',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  subtitleBelowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  subtitleBelow: {
    fontSize: 16,
    color: 'rgba(34,34,34,0.5)',
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
  cardsRowWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 36,
    minHeight: width * 0.65,
    justifyContent: 'center',
  },
  cardsRowAnimated: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    minHeight: width * 0.6,
  },
  card: {
    width: width * 0.38,
    height: width * 0.6,
    borderRadius: 22,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    resizeMode: 'cover',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  cardLeft: {
    transform: [{ rotate: '-10deg' }, { translateY: 12 }],
  },
  cardRight: {
    transform: [{ rotate: '10deg' }, { translateY: 12 }],
  },
  actions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 36,
    marginVertical: 6,
    width: width * 0.7,
    alignItems: 'center',
  },
  buttonText: {
    color: '#4F8CFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 36,
    marginVertical: 6,
    width: width * 0.7,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonOutlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
