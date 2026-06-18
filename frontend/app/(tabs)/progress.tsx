import React, { useState } from 'react';
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

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'achievements'>('overview');

  const achievements = [
    {
      id: 1,
      title: '7-Day Streak',
      description: 'Logged meals for 7 consecutive days',
      earned: true,
      date: '2 days ago',
      tier: 'gold',
    },
    {
      id: 2,
      title: 'Protein Champion',
      description: 'Hit protein target 5 days this week',
      earned: true,
      date: '1 day ago',
      tier: 'silver',
    },
    {
      id: 3,
      title: 'Weight Loss Master',
      description: 'Lost 2kg towards your goal',
      earned: false,
      progress: 75,
      tier: 'gold',
    },
    {
      id: 4,
      title: 'Recipe Explorer',
      description: 'Tried 10 different recipes',
      earned: false,
      progress: 60,
      tier: 'bronze',
    },
  ];

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
                <Text style={styles.statValue}>74.0kg</Text>
                <Text style={styles.statLabel}>Current Weight</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>-1.2kg this week</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Target size={32} color="#d4af37" />
                <Text style={styles.statValue}>73kg</Text>
                <Text style={styles.statLabel}>Target Weight</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>1kg to go</Text>
                </View>
              </View>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <TrendingUp size={24} color="#1a4431" />
                <Text style={styles.chartTitle}>Weight Progress</Text>
              </View>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>
                  📈 Weight tracking chart would appear here
                </Text>
                <Text style={styles.chartSubtext}>
                  Showing 7-day progress trend
                </Text>
              </View>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Zap size={24} color="#d4af37" />
                <Text style={styles.chartTitle}>Weekly Calories</Text>
              </View>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>
                  📊 Calorie intake chart would appear here
                </Text>
                <Text style={styles.chartSubtext}>
                  Daily calories vs target
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
                <Text style={styles.chartPlaceholderText}>
                  🥧 Macro pie chart would appear here
                </Text>
                <Text style={styles.chartSubtext}>
                  Protein, Carbs, Fats breakdown
                </Text>
              </View>
              
              <View style={styles.macroLegend}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroColor, { backgroundColor: '#1a4431' }]} />
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>35%</Text>
                </View>
                <View style={styles.macroItem}>
                  <View style={[styles.macroColor, { backgroundColor: '#d4af37' }]} />
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>45%</Text>
                </View>
                <View style={styles.macroItem}>
                  <View style={[styles.macroColor, { backgroundColor: '#6b7280' }]} />
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroValue}>20%</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>142g</Text>
                <Text style={styles.statLabel}>Avg Daily Protein</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>Above target</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>1,950</Text>
                <Text style={styles.statLabel}>Avg Daily Calories</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>On track</Text>
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