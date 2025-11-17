import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface CustomLoaderProps {
  size?: number;
  color?: string;
}

export default function CustomLoader({ 
  size = 48, 
  color = '#0f766e' // Theme color
}: CustomLoaderProps) {
  const boxAnim = React.useRef(new Animated.Value(0)).current;
  const shadowScaleX = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Box animation - rotates 90deg over 500ms
    Animated.loop(
      Animated.timing(boxAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false, // Border radius animation requires false
      })
    ).start();

    // Shadow animation - scales between 1 and 1.2 over 500ms
    Animated.loop(
      Animated.sequence([
        Animated.timing(shadowScaleX, {
          toValue: 1.2,
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shadowScaleX, {
          toValue: 1,
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolate rotation: 0deg -> 22.5deg (25%) -> 45deg (50%) -> 67.5deg (75%) -> 90deg (100%)
  const rotate = boxAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '22.5deg', '45deg', '67.5deg', '90deg'],
  });

  // Interpolate translateY for bounce effect (0 -> 9 -> 18 -> 9 -> 0)
  const translateY = boxAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 9, 18, 9, 0],
  });

  // Interpolate scaleY for squish effect (1 -> 1 -> 0.9 -> 1 -> 1)
  const scaleY = boxAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 1, 0.9, 1, 1],
  });

  // Interpolate border radius - starts at 4px, becomes more rounded at 50%
  // Note: CSS has border-bottom-right-radius: 40px at 50%, but React Native applies to all corners
  const borderRadius = boxAnim.interpolate({
    inputRange: [0, 0.17, 0.5, 0.75, 1],
    outputRange: [4, 4, 40, 4, 4],
  });

  return (
    <View style={[styles.container, { width: size, height: size + 17 }]}>
      {/* Shadow */}
      <Animated.View
        style={[
          styles.shadow,
          {
            width: size,
            height: 5,
            top: size + 12,
            opacity: 0.25,
            transform: [{ scaleX: shadowScaleX }],
            backgroundColor: color,
            borderRadius: 50,
          },
        ]}
      />
      
      {/* Box */}
      <Animated.View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            backgroundColor: color, // Theme color
            transform: [
              { rotate: rotate },
              { translateY: translateY },
              { scaleY: scaleY },
            ],
            borderRadius: borderRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  box: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  shadow: {
    position: 'absolute',
    left: 0,
  },
});

