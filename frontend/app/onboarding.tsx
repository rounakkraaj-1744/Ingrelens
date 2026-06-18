import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  name: string;
  email: string;
  password: string;
  age: string;
  gender: 'Male' | 'Female' | '';
  height: string;
  weight: string;
  goal: 'Bulk' | 'Cut' | 'Maintain' | '';
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
  });

  const handleNext = () => {
    if (step < 2)
      setStep(step + 1);
    else {
      if (profile.name && profile.email && profile.age && profile.gender && profile.height && profile.weight && profile.goal)
        router.replace('/(tabs)');
      else
        Alert.alert('Please fill all fields');
    }
  };

  const renderLoginStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Welcome to NutriLens</Text>
      <Text style={styles.stepSubtitle}>Your AI-powered nutrition companion</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
          value={profile.name}
          onChangeText={(text) => setProfile({...profile, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          value={profile.email}
          onChangeText={(text) => setProfile({...profile, email: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={profile.password}
          onChangeText={(text) => setProfile({...profile, password: text})}
        />
      </View>
    </View>
  );

  const renderProfileStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={profile.age}
          onChangeText={(text) => setProfile({...profile, age: text})}
        />
        
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderButton, profile.gender === 'Male' && styles.genderButtonActive]}
            onPress={() => setProfile({...profile, gender: 'Male'})}
          >
            <Text style={[styles.genderText, profile.gender === 'Male' && styles.genderTextActive]}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, profile.gender === 'Female' && styles.genderButtonActive]}
            onPress={() => setProfile({...profile, gender: 'Female'})}
          >
            <Text style={[styles.genderText, profile.gender === 'Female' && styles.genderTextActive]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={profile.height}
          onChangeText={(text) => setProfile({...profile, height: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={profile.weight}
          onChangeText={(text) => setProfile({...profile, weight: text})}
        />
      </View>
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What&apos;s your goal?</Text>
      <Text style={styles.stepSubtitle}>We&aspo;ll tailor nutrition recommendations for you</Text>
      
      <View style={styles.goalContainer}>
        {['Bulk', 'Cut', 'Maintain'].map((goalOption) => (
          <TouchableOpacity
            key={goalOption}
            style={[styles.goalButton, profile.goal === goalOption && styles.goalButtonActive]}
            onPress={() => setProfile({...profile, goal: goalOption as any})}
          >
            <Text style={[styles.goalText, profile.goal === goalOption && styles.goalTextActive]}>
              {goalOption}
            </Text>
            <Text style={styles.goalDescription}>
              {goalOption === 'Bulk' && 'Build muscle mass'}
              {goalOption === 'Cut' && 'Lose body fat'}
              {goalOption === 'Maintain' && 'Stay at current weight'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <BlurView intensity={20} style={styles.blurOverlay}>
        <LinearGradient
          colors={['rgba(254, 252, 248, 0.9)', 'rgba(245, 242, 237, 0.95)']}
          style={styles.gradientOverlay}
        />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                step >= index && styles.progressDotActive
              ]}
            />
          ))}
        </View>

        <View style={styles.contentContainer}>
          {step === 0 && renderLoginStep()}
          {step === 1 && renderProfileStep()}
          {step === 2 && renderGoalStep()}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {step === 2 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCF8',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.4,
  },
  blurOverlay: {
    position: 'absolute',
    width: width,
    height: height,
  },
  gradientOverlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: '#8B5CF6',
  },
  contentContainer: {
    flex: 1,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2C2C2C',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  genderButton: {
    flex: 0.48,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  genderButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  genderText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
  goalContainer: {
    width: '100%',
  },
  goalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  goalButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  goalText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  goalTextActive: {
    color: '#FFFFFF',
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});