import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import {
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3,
  Target,
  Activity,
  Apple,
  ChevronRight,
  Crown,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react-native';

interface UserData {
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  fitnessGoal: 'bulk' | 'cut' | 'maintain';
  dailyCalories: number;
  streak: number;
}

export default function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const userData: UserData = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    age: 28,
    weight: 75,
    height: 180,
    activityLevel: 'moderate',
    fitnessGoal: 'cut',
    dailyCalories: 2000,
    streak: 7,
  };

  const getGoalEmoji = () => {
    switch (userData?.fitnessGoal) {
      case 'bulk': return '💪';
      case 'cut': return '🔥';
      default: return '⚖️';
    }
  };

  const getActivityLevelText = () => {
    switch (userData?.activityLevel) {
      case 'sedentary': return 'Sedentary';
      case 'light': return 'Light activity';
      case 'moderate': return 'Moderate activity';
      case 'intense': return 'Very active';
      default: return 'Not set';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing would open here');
  };

  const handleNotificationSettings = () => {
    Alert.alert('Notifications', 'Notification settings would open here');
  };

  const handleDietaryPreferences = () => {
    Alert.alert('Dietary Preferences', 'Dietary preferences would open here');
  };

  const handlePrivacySecurity = () => {
    Alert.alert('Privacy & Security', 'Privacy settings would open here');
  };

  const handleHelpSupport = () => {
    Alert.alert('Help & Support', 'Help center would open here');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
              <View style={styles.crownBadge}>
                <Crown size={12} color="white" />
              </View>
            </View>
          </View>
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Your Metrics</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit3 size={16} color="#1a4431" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{userData?.weight}kg</Text>
                <Text style={styles.metricLabel}>Weight</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{userData?.height}cm</Text>
                <Text style={styles.metricLabel}>Height</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{userData?.age}</Text>
                <Text style={styles.metricLabel}>Age</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{userData?.dailyCalories}</Text>
                <Text style={styles.metricLabel}>Daily Calories</Text>
              </View>
            </View>
          </View>

          <View style={styles.goalsGrid}>
            <View style={styles.goalCard}>
              <Target size={24} color="#1a4431" />
              <Text style={styles.goalLabel}>Fitness Goal</Text>
              <View style={styles.goalValue}>
                <Text style={styles.goalEmoji}>{getGoalEmoji()}</Text>
                <Text style={styles.goalText}>{userData?.fitnessGoal}</Text>
              </View>
            </View>

            <View style={styles.goalCard}>
              <Activity size={24} color="#d4af37" />
              <Text style={styles.goalLabel}>Activity Level</Text>
              <Text style={styles.goalText}>{getActivityLevelText()}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Settings size={20} color="#1a4431" />
              <Text style={styles.cardTitle}>Settings</Text>
            </View>
            
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  {isDarkMode ? (
                    <Moon size={20} color="#1a4431" />
                  ) : (
                    <Sun size={20} color="#d4af37" />
                  )}
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      Switch between light and dark themes
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: '#e5e7eb', true: '#1a4431' }}
                  thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.separator} />
              
              <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
                <View style={styles.settingInfo}>
                  <Bell size={20} color="#1a4431" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Notifications</Text>
                    <Text style={styles.settingSubtitle}>
                      Manage your notification preferences
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem} onPress={handleDietaryPreferences}>
                <View style={styles.settingInfo}>
                  <Apple size={20} color="#d4af37" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Dietary Preferences</Text>
                    <Text style={styles.settingSubtitle}>
                      Manage your dietary restrictions
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.settingsList}>
              <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySecurity}>
                <View style={styles.settingInfo}>
                  <Shield size={20} color="#1a4431" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Privacy & Security</Text>
                    <Text style={styles.settingSubtitle}>
                      Manage your account security
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
                <View style={styles.settingInfo}>
                  <HelpCircle size={20} color="#d4af37" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Help & Support</Text>
                    <Text style={styles.settingSubtitle}>
                      Get help and contact support
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#ef4444" />
              <View style={styles.settingText}>
                <Text style={styles.logoutTitle}>Sign Out</Text>
                <Text style={styles.logoutSubtitle}>
                  Sign out of your account
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.versionContainer}>
            <View style={styles.versionInfo}>
              <Sparkles size={16} color="#d4af37" />
              <Text style={styles.versionText}>NutriLens Premium v1.0.0</Text>
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
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a4431',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
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
    fontWeight: '700',
    color: '#1f2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#1a4431',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  goalCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalLabel: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
  },
  goalValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  goalText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  settingsList: {
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 16,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 4,
  },
  logoutSubtitle: {
    fontSize: 14,
    color: '#dc2626',
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
});