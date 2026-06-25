import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Camera,
  TrendingUp,
  BookOpen,
  ShoppingCart,
  Flame,
  Target,
  Zap,
  Bell,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { fetchWeeklyInsights, fetchMealHistory, MealHistoryItem } from '@/lib/api';

export default function HomeScreen() {
  const { profile, authToken, pantryItems } = useApp();
  const [insights, setInsights] = useState<{ avg_calories?: number; avg_protein?: number; adherence_score?: number } | null>(null);
  const [mealHistory, setMealHistory] = useState<MealHistoryItem[]>([]);
  const hasProfile = Boolean(profile.email || profile.name);
  const missingItemsCount = pantryItems.filter(item => item.status !== 'fresh').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStreakMessage = () => {
    const streak = profile?.streak || 0;
    if (streak === 0) return 'Start your journey today!';
    if (streak === 1) return 'Great start! Keep it up!';
    if (streak < 7) return `${streak} days strong!`;
    if (streak < 30) return `Amazing! ${streak} days!`;
    return `Incredible! ${streak} days!`;
  };

  const handleScanIngredients = () => {
    router.push('/scanner');
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 3 new notifications');
  };

  const dailyCalories = profile?.dailyCalories || 2000;
  const consumedCalories = insights?.avg_calories ? Math.round(insights.avg_calories) : 0;
  const calorieProgress = (consumedCalories / dailyCalories) * 100;

  useEffect(() => {
    if (!authToken) {
      setInsights(null);
      setMealHistory([]);
      return;
    }

    Promise.all([
      fetchWeeklyInsights(authToken).catch(() => null),
      fetchMealHistory(authToken).catch(() => ({ history: [] })),
    ]).then(([weekly, meals]) => {
      setInsights(weekly);
      setMealHistory(meals?.history || []);
    });
  }, [authToken]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{profile?.name || 'Welcome back'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotificationPress}
              >
                <Bell size={20} color="#6b7280" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.name?.charAt(0) || 'U'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanIngredients}
          >
            <Camera size={24} color="white" />
            <Text style={styles.scanButtonText}>Scan Ingredients</Text>
            <View style={styles.scanButtonDots}>
              <View style={[styles.dot, { opacity: 0.6 }]} />
              <View style={[styles.dot, { opacity: 0.4 }]} />
              <View style={[styles.dot, { opacity: 0.2 }]} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
            <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today&apos;s Progress</Text>
              <Flame size={20} color="#d4af37" />
            </View>
            
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Calories</Text>
                <Text style={styles.progressValue}>
                  {hasProfile ? `${consumedCalories} / ${dailyCalories}` : 'No data yet'}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${hasProfile ? Math.min(calorieProgress, 100) : 0}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.macroGrid}>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: '#1a4431' }]}>{insights?.avg_protein ? `${Math.round(insights.avg_protein)}g` : '0g'}</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: '#d4af37' }]}>{hasProfile ? '0g' : '0g'}</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: '#6b7280' }]}>{hasProfile ? '0g' : '0g'}</Text>
                <Text style={styles.macroLabel}>Fats</Text>
              </View>
            </View>
            {insights ? (
              <View style={styles.insightBanner}>
                <Text style={styles.insightTitle}>Weekly adherence</Text>
                <Text style={styles.insightValue}>{Math.round((insights.adherence_score || 0) * 100)}%</Text>
              </View>
            ) : (
              <View style={styles.insightBanner}>
                <Text style={styles.insightTitle}>Start tracking</Text>
                <Text style={styles.insightValue}>Scan a meal to see your progress</Text>
              </View>
            )}
          </View>

          {/* Streak Card */}
          <View style={styles.card}>
            <View style={styles.streakContent}>
              <View style={styles.streakInfo}>
                <View style={styles.streakHeader}>
                  <Target size={20} color="#1a4431" />
                  <Text style={styles.streakTitle}>Streak</Text>
                </View>
                <Text style={styles.streakNumber}>{profile?.streak || 0}</Text>
                <Text style={styles.streakMessage}>{profile?.streak ? getStreakMessage() : 'No streak yet'}</Text>
              </View>
              <View style={styles.streakIcon}>
                <Zap size={28} color="white" />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/recipes')}
            >
              <BookOpen size={24} color="#1a4431" />
              <Text style={styles.actionButtonText}>My Recipes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/progress')}
            >
              <TrendingUp size={24} color="#d4af37" />
              <Text style={styles.actionButtonText}>Progress</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Meals</Text>
            <View style={styles.mealsList}>
              {!hasProfile || mealHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No meals logged yet</Text>
                  <Text style={styles.emptyStateText}>Scan a meal or log one manually and it will show up here.</Text>
                </View>
              ) : (
                <>
                  {mealHistory.slice(0, 2).map((meal, index) => (
                    <View key={meal.id} style={styles.mealItem}>
                      <View style={styles.mealImageFallback}>
                        <Text style={styles.mealImageFallbackText}>{meal.meal_name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.meal_name}</Text>
                        <Text style={styles.mealDetails}>
                          {meal.nutrition_summary?.calories ? `${Math.round(meal.nutrition_summary.calories)} cal` : 'Logged meal'} • {meal.meal_type}
                        </Text>
                      </View>
                      <Text style={styles.mealTime}>{index === 0 ? 'Latest' : 'Earlier'}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.shoppingListContent}>
              <View>
                <Text style={styles.cardTitle}>Shopping List</Text>
                <Text style={styles.shoppingListSubtitle}>
                  {missingItemsCount} items to buy for this week
                </Text>
              </View>
              <TouchableOpacity
                style={styles.shoppingListButton}
                onPress={() => router.push('/pantry')}
              >
                <ShoppingCart size={16} color="white" />
                <Text style={styles.shoppingListButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#d4af37',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a4431',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a4431',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#1a4431',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#1a4431',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  scanButtonDots: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  content: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a4431',
    borderRadius: 4,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a4431',
    marginLeft: 12,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1a4431',
    marginBottom: 8,
  },
  streakMessage: {
    fontSize: 14,
    color: '#1f2937',
  },
  streakIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 96,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 8,
    fontWeight: '500',
  },
  mealsList: {
    gap: 16,
    marginTop: 16,
  },
  emptyState: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mealImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  mealImageFallback: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#edf7f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealImageFallbackText: {
    color: '#1a4431',
    fontWeight: '700',
    fontSize: 18,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  mealDetails: {
    fontSize: 14,
    color: '#9ca3af',
  },
  mealTime: {
    fontSize: 12,
    color: '#d1d5db',
  },
  shoppingListContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shoppingListSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  shoppingListButton: {
    backgroundColor: '#d4af37',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  shoppingListButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
