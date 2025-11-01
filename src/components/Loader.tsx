import { View, Animated, Easing, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";

export default function Loader() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[styles.loader, { transform: [{ rotate: spin }] }]}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderColor: '#10b981',
    marginTop: 20,
  },
});
