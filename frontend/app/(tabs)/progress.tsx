import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  Scale,
  Zap,
  Trophy,
  Star,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { fetchWeeklyInsights } from '@/lib/api';

export default function ProgressScreen() {
  const { profile } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'achievements'>('overview');
  const [insights, setInsights] = useState<{ avg_calories?: number; avg_protein?: number; adherence_score?: number; top_foods?: string[] } | null>(null);

  const achievements = useMemo(() => [
    {
      id: 1,
      title: '7-Day Streak',
      description: 'Logged meals for 7 consecutive days',
      earned: profile.streak >= 7,
      date: profile.streak >= 7 ? 'This week' : 'Keep going',
      tier: 'gold',
    },
    {
      id: 2,
      title: 'Protein Champion',
      description: 'Hit protein target 5 days this week',
      earned: (insights?.avg_protein || 0) >= (profile.targetProtein || 0) * 0.8,
      date: 'This week',
      tier: 'silver',
    },
    {
      id: 3,
      title: 'Weight Loss Master',
      description: 'Lost 2kg towards your goal',
      earned: profile.fitnessGoal === 'cut' && (insights?.adherence_score || 0) > 0.7,
      progress: Math.round((insights?.adherence_score || 0) * 100),
      tier: 'gold',
    },
    {
      id: 4,
      title: 'Recipe Explorer',
      description: 'Tried 10 different recipes',
      earned: (insights?.top_foods || []).length >= 4,
      progress: Math.min(100, ((insights?.top_foods || []).length / 4) * 100),
      tier: 'bronze',
    },
  ], [profile.streak, profile.targetProtein, profile.fitnessGoal, insights]);

  useEffect(() => {
    if (!profile.email) {
      setInsights(null);
      return;
    }
    fetchWeeklyInsights('demo-token')
      .then(setInsights)
      .catch(() => setInsights(null));
  }, [profile.email]);

  const getAchievementTierColor = (tier: string) => {
    switch (tier) {
      case 'gold': return '#fbbf24';
      case 'silver': return '#9ca3af';
      case 'bronze': return '#d4af37';
      default: return '#e5e7eb';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Scale size={32} color="#1a4431" />
                <Text style={styles.statValue}>{profile.weight ? `${profile.weight}kg` : '—'}</Text>
                <Text style={styles.statLabel}>Current Weight</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{profile.weight ? (profile.fitnessGoal === 'cut' ? 'Tracking cut' : 'Tracking maintain') : 'Set up profile'}</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Target size={32} color="#d4af37" />
                <Text style={styles.statValue}>{profile.targetWeight ? `${profile.targetWeight}kg` : '—'}</Text>
                <Text style={styles.statLabel}>Target Weight</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{profile.targetWeight ? 'Goal set' : 'Set profile'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <TrendingUp size={24} color="#1a4431" />
                <Text style={styles.chartTitle}>Weight Progress</Text>
              </View>
                <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>Weekly trend is now backed by live meal logs</Text>
                <Text style={styles.chartSubtext}>{insights ? `${Math.round((insights.adherence_score || 0) * 100)}% adherence` : 'No tracked meals yet'}</Text>
              </View>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Zap size={24} color="#d4af37" />
                <Text style={styles.chartTitle}>Weekly Calories</Text>
              </View>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>
                  {insights ? `Avg calories ${Math.round(insights.avg_calories || 0)}` : 'Calorie chart waits for logged meals'}
                </Text>
                <Text style={styles.chartSubtext}>
                  Compare intake against your target
                </Text>
              </View>
            </View>
          </View>
        );

      case 'nutrition':
        return (
          <View style={styles.tabContent}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Macro Distribution</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>Macro distribution is derived from profile targets</Text>
                <Text style={styles.chartSubtext}>Protein, carbs, and fats breakdown</Text>
              </View>
              
              <View style={styles.macroLegend}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroColor, { backgroundColor: '#1a4431' }]} />
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{profile.targetProtein ? `${Math.round((profile.targetProtein / (profile.targetProtein + profile.targetCarbs + profile.targetFats)) * 100)}%` : '—'}</Text>
                </View>
                <View style={styles.macroItem}>
                  <View style={[styles.macroColor, { backgroundColor: '#d4af37' }]} />
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{profile.targetCarbs ? `${Math.round((profile.targetCarbs / (profile.targetProtein + profile.targetCarbs + profile.targetFats)) * 100)}%` : '—'}</Text>
                </View>
                <View style={styles.macroItem}>
                  <View style={[styles.macroColor, { backgroundColor: '#6b7280' }]} />
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroValue}>{profile.targetFats ? `${Math.round((profile.targetFats / (profile.targetProtein + profile.targetCarbs + profile.targetFats)) * 100)}%` : '—'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{insights?.avg_protein ? `${Math.round(insights.avg_protein)}g` : '—'}</Text>
                <Text style={styles.statLabel}>Avg Daily Protein</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{insights?.avg_protein ? (profile.targetProtein && insights.avg_protein > profile.targetProtein ? 'Above target' : 'On track') : 'No logs yet'}</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{insights?.avg_calories ? Math.round(insights.avg_calories).toLocaleString() : '—'}</Text>
                <Text style={styles.statLabel}>Avg Daily Calories</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{insights ? 'Live data' : 'No logs yet'}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'achievements':
        return (
          <View style={styles.tabContent}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementContent}>
                  <View
                    style={[
                      styles.achievementIcon,
                      {
                        backgroundColor: achievement.earned
                          ? getAchievementTierColor(achievement.tier)
                          : '#e5e7eb',
                      },
                    ]}
                  >
                    {achievement.earned ? (
                      <Trophy size={32} color="white" />
                    ) : (
                      <Award size={32} color="#9ca3af" />
                    )}
                  </View>
                  
                  <View style={styles.achievementInfo}>
                    <View style={styles.achievementHeader}>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      {achievement.earned && (
                        <View
                          style={[
                            styles.earnedBadge,
                            { backgroundColor: getAchievementTierColor(achievement.tier) },
                          ]}
                        >
                          <Star size={12} color="white" />
                          <Text style={styles.earnedBadgeText}>Earned</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    
                    {achievement.earned ? (
                      <View style={styles.achievementDate}>
                        <Calendar size={16} color="#9ca3af" />
                        <Text style={styles.achievementDateText}>{achievement.date}</Text>
                      </View>
                    ) : (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={styles.progressValue}>{achievement.progress}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${achievement.progress}%` },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Journey</Text>
        <View style={styles.goalIndicator}>
          <Text style={styles.goalEmoji}>🔥</Text>
          <Text style={styles.goalText}>Losing Weight</Text>
        </View>
      </View>

      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'overview' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'overview' && styles.activeTabButtonText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'nutrition' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'nutrition' && styles.activeTabButtonText,
            ]}
          >
            Nutrition
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'achievements' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'achievements' && styles.activeTabButtonText,
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  goalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  goalText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 32,
    marginVertical: 32,
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#1a4431',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabButtonText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  tabContent: {
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4431',
    marginTop: 16,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  statBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statBadgeText: {
    color: '#1a4431',
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  macroLegend: {
    marginTop: 24,
    gap: 16,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
  },
  macroColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  macroLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '700',
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  achievementDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementDateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '700',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a4431',
    borderRadius: 6,
  },
});
