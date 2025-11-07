import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

export default function HomeSkeleton() {
  return (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Reminders Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonHeader}>
          <View style={[styles.skeletonText, { width: 150, height: 20 }]} />
          <View style={[styles.skeletonText, { width: 80, height: 16 }]} />
        </View>
        <View style={styles.skeletonItem} />
        <View style={styles.skeletonItem} />
      </View>

      <View style={styles.skeletonCard}>
        <View style={styles.skeletonHeader}>
          <View style={[styles.skeletonText, { width: 180, height: 20 }]} />
        </View>
        <View style={styles.skeletonGrid}>
          <View style={styles.skeletonGridItem} />
          <View style={styles.skeletonGridItem} />
        </View>
      </View>

      {/* Daily Plans Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonHeader}>
          <View style={[styles.skeletonText, { width: 120, height: 20 }]} />
          <View style={[styles.skeletonButton, { width: 100 }]} />
        </View>
        <View style={styles.skeletonList}>
          <View style={styles.skeletonListItem} />
          <View style={styles.skeletonListItem} />
          <View style={styles.skeletonListItem} />
        </View>
      </View>

      {/* Quick Action Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonHeader}>
          <View style={[styles.skeletonText, { width: 100, height: 20 }]} />
        </View>
        <View style={styles.skeletonServiceGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <View key={item} style={styles.skeletonServiceItem} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonText: {
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonButton: {
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  skeletonItem: {
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonGridItem: {
    flex: 1,
    height: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonListItem: {
    height: 60,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonServiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonServiceItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
});

