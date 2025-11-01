import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchSuggestion } from '../utils/SearchSuggestions';

interface InlineSearchSuggestionsProps {
  visible: boolean;
  searchQuery: string;
  suggestions: SearchSuggestion[];
  onSuggestionPress: (suggestion: SearchSuggestion) => void;
}

export default function InlineSearchSuggestions({ 
  visible, 
  searchQuery, 
  suggestions, 
  onSuggestionPress 
}: InlineSearchSuggestionsProps) {
  if (!visible || searchQuery.length === 0) {
    return null;
  }

  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).slice(0, 5); // Show only top 5 suggestions

  if (filteredSuggestions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={24} color="#9ca3af" />
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      </View>
    );
  }

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSuggestionPress(item)}
    >
      <View style={styles.suggestionIcon}>
        <Ionicons name={item.icon as any} size={20} color="#0f766e" />
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>{item.title}</Text>
        <Text style={styles.suggestionDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.suggestionsList}>
        {filteredSuggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionItem}
            onPress={() => onSuggestionPress(suggestion)}
          >
            <View style={styles.suggestionIcon}>
              <Ionicons name={suggestion.icon as any} size={20} color="#0f766e" />
            </View>
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  noResultsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
});
