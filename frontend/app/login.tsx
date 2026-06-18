import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { setProfile } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setProfile({ email });
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignUp = () => {
    router.push('/onboarding');
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality would be implemented here');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome back</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
          <Text style={styles.title}>Sign in to your account</Text>
          <Text style={styles.subtitle}>Continue your premium nutrition journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9ca3af" />
                ) : (
                  <Eye size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
            <Text style={styles.forgotButtonText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.signUpSection}>
          <Text style={styles.signUpText}>
            Don&apos;t have an account?{' '}
            <Text style={styles.signUpLink} onPress={handleSignUp}>
              Sign up
            </Text>
          </Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingRight: 56,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotButtonText: {
    fontSize: 16,
    color: '#d4af37',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#1a4431',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a4431',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  socialSection: {
    marginBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 12,
    color: '#9ca3af',
    paddingHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  signUpSection: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#6b7280',
  },
  signUpLink: {
    color: '#d4af37',
    fontWeight: '600',
  },
});
