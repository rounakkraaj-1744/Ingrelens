import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Search, Filter, X } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

export default function SearchScreen() {
  const { recipes, pantryItems, profile } = useApp();
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filters = useMemo(() => {
    const dynamic = new Set<string>();
    recipes.forEach((recipe) => recipe.tags.forEach((tag) => dynamic.add(tag)));
    dynamic.add(profile.fitnessGoal === 'cut' ? 'low carb' : 'high protein');
    return Array.from(dynamic).slice(0, 8);
  }, [recipes, profile.fitnessGoal]);

  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    recipes.slice(0, 5).forEach((recipe) => suggestions.add(recipe.title));
    pantryItems.slice(0, 4).forEach((item) => suggestions.add(item.name));
    return Array.from(suggestions).slice(0, 6);
  }, [recipes, pantryItems]);

  const recentSearches = useMemo(() => {
    return recipes.slice(0, 4).map((recipe) => recipe.title);
  }, [recipes]);

  const trendingIngredients = useMemo(() => {
    return pantryItems.slice(0, 4).map((item, index) => ({
      name: item.name,
      image: [
        'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg',
        'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg',
        'https://images.pexels.com/photos/616353/pexels-photo-616353.jpeg',
        'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg',
      ][index % 4],
      recipes: Math.max(8, 25 - index * 3),
    }));
  }, [pantryItems]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearSearch = () => {
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover Recipes</Text>
          <Text style={styles.subtitle}>Search ingredients, recipes, or nutrition goals</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <BlurView intensity={20} style={styles.searchContainer}>
            <Search size={20} color="#6B7280" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ingredients or recipes..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.filtersHeader}>
            <Text style={styles.sectionTitle}>Filters</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#8B5CF6" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {filters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  activeFilters.includes(filter) && styles.filterChipActive
                ]}
                onPress={() => toggleFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  activeFilters.includes(filter) && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Searches */}
        {searchText.length === 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity key={index} style={styles.recentItem}>
                <Search size={16} color="#9CA3AF" strokeWidth={2} />
                <Text style={styles.recentText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Suggestions */}
        {searchText.length === 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Trending Ingredients */}
        {searchText.length === 0 && (
          <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>Trending Ingredients</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {trendingIngredients.map((ingredient, index) => (
                <BlurView key={index} intensity={15} style={styles.trendingCard}>
                  <Image source={{ uri: ingredient.image }} style={styles.trendingImage} resizeMode="cover" />
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingName}>{ingredient.name}</Text>
                    <Text style={styles.trendingCount}>{ingredient.recipes} recipes</Text>
                  </View>
                </BlurView>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCF8',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
  },
  filtersSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    letterSpacing: -0.3,
  },
  filterButton: {
    padding: 8,
  },
  filtersScroll: {
    paddingRight: 24,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  recentText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    marginLeft: 12,
  },
  suggestionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  suggestionItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
  },
  trendingSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  trendingScroll: {
    paddingRight: 24,
  },
  trendingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  trendingImage: {
    width: 108,
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  trendingInfo: {
    alignItems: 'center',
  },
  trendingName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 4,
    textAlign: 'center',
  },
  trendingCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});
