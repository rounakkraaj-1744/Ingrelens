import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Clock, Users, Zap, Heart, Search, X, TrendingUp } from 'lucide-react-native';

const recipes = [
  {
    id: 1,
    title: 'Mediterranean Quinoa Bowl',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    time: '25 mins',
    servings: 2,
    calories: 420,
    protein: '18g',
    carbs: '45g',
    fat: '15g',
    difficulty: 'Easy',
    liked: false,
  },
  {
    id: 2,
    title: 'Grilled Salmon with Asparagus',
    image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
    time: '20 mins',
    servings: 1,
    calories: 380,
    protein: '32g',
    carbs: '8g',
    fat: '24g',
    difficulty: 'Medium',
    liked: true,
  },
  {
    id: 3,
    title: 'Chicken & Veggie Stir Fry',
    image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg',
    time: '15 mins',
    servings: 3,
    calories: 290,
    protein: '28g',
    carbs: '12g',
    fat: '14g',
    difficulty: 'Easy',
    liked: false,
  },
  {
    id: 4,
    title: 'Avocado Toast Supreme',
    image: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg',
    time: '10 mins',
    servings: 1,
    calories: 320,
    protein: '12g',
    carbs: '28g',
    fat: '18g',
    difficulty: 'Easy',
    liked: true,
  },
];

const categories = [
  { name: 'High Protein', color: '#8B5CF6', count: 24 },
  { name: 'Low Carb', color: '#10B981', count: 18 },
  { name: 'Quick & Easy', color: '#F59E0B', count: 32 },
  { name: 'Vegetarian', color: '#EF4444', count: 15 },
];

const searchSuggestions = [
  'High protein recipes',
  'Low carb meals', 
  'Vegetarian options',
  'Quick 15-minute meals',
  'Mediterranean diet',
  'Keto-friendly recipes',
  'Meal prep ideas',
  'Gluten-free options',
];

const trendingSearches = [
  'Quinoa bowl',
  'Salmon recipes',
  'Chicken breast',
  'Avocado toast',
  'Green smoothie',
];

export default function RecipesScreen() {
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      setShowSuggestions(true);
      const filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setShowSuggestions(false);
      setFilteredRecipes(recipes);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchText(suggestion);
    setShowSuggestions(false);
    const filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(suggestion.toLowerCase()) ||
      suggestion.toLowerCase().includes('protein') && parseInt(recipe.protein) > 20 ||
      suggestion.toLowerCase().includes('quick') && parseInt(recipe.time) <= 15 ||
      suggestion.toLowerCase().includes('low carb') && parseInt(recipe.carbs) < 15
    );
    setFilteredRecipes(filtered);
  };

  const clearSearch = () => {
    setSearchText('');
    setShowSuggestions(false);
    setFilteredRecipes(recipes);
  };

  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)} >
      <Search size={16} color="#6B7280" strokeWidth={2} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipe Suggestions</Text>
          <Text style={styles.subtitle}>Based on your detected ingredients</Text>
        </View>

        <View style={styles.searchSection}>
          <BlurView intensity={20} style={styles.searchContainer}>
            <Search size={20} color="#6B7280" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes, ingredients, or diet types..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={handleSearch}
              onFocus={() => searchText.length === 0 && setShowSuggestions(true)}/>
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <X size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </BlurView>

          {showSuggestions && (
            <BlurView intensity={25} style={styles.suggestionsDropdown}>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsTitle}>
                  {searchText.length > 0 ? 'Suggestions' : 'Popular Searches'}
                </Text>
                <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                  <X size={16} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              </View>
              
              {searchText.length === 0 && (
                <View style={styles.trendingSection}>
                  <View style={styles.trendingHeader}>
                    <TrendingUp size={14} color="#8B5CF6" strokeWidth={2} />
                    <Text style={styles.trendingTitle}>Trending Now</Text>
                  </View>
                  {trendingSearches.map((trend, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.trendingItem}
                      onPress={() => handleSuggestionPress(trend)}
                    >
                      <Text style={styles.trendingText}>{trend}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <FlatList data={searchSuggestions.filter(suggestion =>
                  searchText.length === 0 || suggestion.toLowerCase().includes(searchText.toLowerCase())
                )}
                renderItem={renderSuggestionItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.suggestionsList}
                showsVerticalScrollIndicator={false}
                maxHeight={200}/>
            </BlurView>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={[styles.categoryCard, { backgroundColor: category.color + '20' }]}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} recipes</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recipes */}
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>
            {searchText.length > 0 ? `Results for "${searchText}"` : 'Recommended for You'}
          </Text>
          {filteredRecipes.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No recipes found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search terms</Text>
            </View>
          ) : (
            filteredRecipes.map((recipe, index) => (
              <BlurView key={recipe.id} intensity={20} style={styles.recipeCard}>
                <Image source={{ uri: recipe.image }} style={styles.recipeImage} resizeMode="cover" />
                
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
                  style={styles.recipeGradient}
                />
                
                <TouchableOpacity style={styles.likeButton}>
                  <Heart size={20} color={recipe.liked ? '#EF4444' : '#FFFFFF'} fill={recipe.liked ? '#EF4444' : 'transparent'} strokeWidth={2} />
                </TouchableOpacity>
                
                <View style={styles.recipeContent}>
                  <View style={styles.recipeHeader}>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <View style={styles.recipeDetails}>
                      <View style={styles.recipeDetailItem}>
                        <Clock size={14} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.recipeDetailText}>{recipe.time}</Text>
                      </View>
                      <View style={styles.recipeDetailItem}>
                        <Users size={14} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.recipeDetailText}>{recipe.servings} servings</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.macroContainer}>
                    <View style={styles.macroItem}>
                      <Zap size={12} color="#F59E0B" strokeWidth={2} />
                      <Text style={styles.macroValue}>{recipe.calories}</Text>
                      <Text style={styles.macroLabel}>cal</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{recipe.protein}</Text>
                      <Text style={styles.macroLabel}>protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{recipe.carbs}</Text>
                      <Text style={styles.macroLabel}>carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{recipe.fat}</Text>
                      <Text style={styles.macroLabel}>fat</Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            ))
          )}
        </View>
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
    position: 'relative',
    zIndex: 1000,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
  },
  clearButton: {
    padding: 4,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 300,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
  },
  trendingSection: {
    marginBottom: 12,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendingItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  trendingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.2)',
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  categoriesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  categoriesScroll: {
    paddingRight: 24,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    minWidth: 130,
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  recipesSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  recipeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  likeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  recipeHeader: {
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recipeDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});