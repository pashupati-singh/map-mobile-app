import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface ButtonLoaderProps {
  size?: number;
  color?: string;
  variant?: 'default' | 'white';
}

export default function ButtonLoader({ 
  size = 20, 
  color,
  variant = 'default'
}: ButtonLoaderProps) {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Determine color based on variant
  const loaderColor = color || (variant === 'white' ? '#FFFFFF' : '#FFFFFF');

  useEffect(() => {
    // Create staggered animation for three dots
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createAnimation(dot1Anim, 0);
    const anim2 = createAnimation(dot2Anim, 200);
    const anim3 = createAnimation(dot3Anim, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const scale1 = dot1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const scale2 = dot2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const scale3 = dot3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const opacity1 = dot1Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  const opacity2 = dot2Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  const opacity3 = dot3Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  const dotSize = size * 0.4;
  const spacing = size * 0.3;

  return (
    <View style={[styles.container, { width: size * 3, height: size }]}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: loaderColor,
            transform: [{ scale: scale1 }],
            opacity: opacity1,
            marginRight: spacing,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: loaderColor,
            transform: [{ scale: scale2 }],
            opacity: opacity2,
            marginRight: spacing,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: loaderColor,
            transform: [{ scale: scale3 }],
            opacity: opacity3,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    // Styles applied inline
  },
});

