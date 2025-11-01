import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f766e', '#14b8a6']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.skeletonCircle} />
          <View style={styles.skeletonTextContainer}>
            <View style={[styles.skeletonText, { width: 120, marginBottom: 8 }]} />
            <View style={[styles.skeletonText, { width: 150 }]} />
          </View>
        </View>
        <View style={styles.skeletonSearch} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 16,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonText: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  skeletonSearch: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  content: {
    padding: 20,
  },
  skeletonCard: {
    height: 200,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
  },
});

