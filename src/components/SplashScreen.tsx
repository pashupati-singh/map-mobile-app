import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Stethoscope Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.stethoscope}>
            <View style={styles.earpiece1} />
            <View style={styles.earpiece2} />
            <View style={styles.tube} />
            <View style={styles.diaphragm} />
          </View>
        </View>
        
        {/* MedicMap Text */}
        <Text style={styles.brandName}>MedicMap</Text>
        <View style={styles.underline} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f766e', // Dark teal background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#10b981', // Light green
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stethoscope: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  earpiece1: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  earpiece2: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  tube: {
    position: 'absolute',
    top: 15,
    left: 20,
    width: 10,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    transform: [{ rotate: '45deg' }],
  },
  diaphragm: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    width: 15,
    height: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981', // Light green
    marginBottom: 8,
  },
  underline: {
    width: 120,
    height: 3,
    backgroundColor: '#10b981', // Light green
    borderRadius: 2,
  },
});
