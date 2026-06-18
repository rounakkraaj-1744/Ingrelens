import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Hero Image */}
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(254, 252, 248, 0.9)', 'rgba(245, 242, 237, 0.95)']}
        style={styles.gradientOverlay}
      />

      {/* Corner Food Images */}
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg' }}
        style={[styles.cornerImage, styles.topLeft]}
        resizeMode="cover"
      />
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg' }}
        style={[styles.cornerImage, styles.topRight]}
        resizeMode="cover"
      />
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg' }}
        style={[styles.cornerImage, styles.bottomLeft]}
        resizeMode="cover"
      />
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg' }}
        style={[styles.cornerImage, styles.bottomRight]}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>NutriLens</Text>
          <Text style={styles.logoSubtext}>AI Nutrition Assistant</Text>
        </View>
        
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Snap. Detect. Cook Smart.</Text>
        </View>
        
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDelay1]} />
          <View style={[styles.loadingDot, styles.loadingDelay2]} />
        </View>
      </View>
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
    opacity: 0.3,
  },
  gradientOverlay: {
    position: 'absolute',
    width: width,
    height: height,
  },
  cornerImage: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 20,
    opacity: 0.8,
  },
  topLeft: {
    top: 60,
    left: -40,
    transform: [{ rotate: '-15deg' }],
  },
  topRight: {
    top: 80,
    right: -40,
    transform: [{ rotate: '15deg' }],
  },
  bottomLeft: {
    bottom: 120,
    left: -30,
    transform: [{ rotate: '12deg' }],
  },
  bottomRight: {
    bottom: 100,
    right: -35,
    transform: [{ rotate: '-12deg' }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoText: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#2C2C2C',
    letterSpacing: -1,
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 4,
    opacity: 0.3,
  },
  loadingDelay1: {
    opacity: 0.6,
  },
  loadingDelay2: {
    opacity: 1,
  },
});