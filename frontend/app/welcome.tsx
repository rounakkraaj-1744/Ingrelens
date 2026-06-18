import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Leaf, Sparkles, Camera, ChefHat, Target } from 'lucide-react-native';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/onboarding');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1580802841960-bb47baa91eac?w=400&h=800&fit=crop',
          }}
          style={styles.backgroundImage}
        />
        <View style={styles.overlay} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo and Branding */}
        <View style={styles.branding}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Leaf size={56} color="white" />
            </View>
          </View>
          <Text style={styles.title}>NutriLens</Text>
          <View style={styles.taglineContainer}>
            <Sparkles size={16} color="#d4af37" />
            <Text style={styles.tagline}>
              AI-powered nutrition intelligence that transforms how you discover, prepare, and track your meals
            </Text>
            <Sparkles size={16} color="#d4af37" />
          </View>
        </View>

        {/* Feature Highlights */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Camera size={28} color="#1a4431" />
            </View>
            <Text style={styles.featureText}>Smart Scan</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <ChefHat size={28} color="#d4af37" />
            </View>
            <Text style={styles.featureText}>AI Recipes</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Target size={28} color="#1a4431" />
            </View>
            <Text style={styles.featureText}>Track Goals</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
            <Sparkles size={20} color="white" />
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
            <Text style={styles.secondaryButtonText}>I have an account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 251, 252, 0.95)',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    zIndex: 1,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1a4431',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a4431',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
    letterSpacing: -1,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 320,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 8,
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
    marginBottom: 48,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(26, 68, 49, 0.08)',
  },
  featureText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#1a4431',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#1a4431',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 68, 49, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    fontWeight: '500',
  },
});