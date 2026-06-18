import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  ArrowLeft,
  Camera,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react-native';

interface DetectedIngredient {
  name: string;
  confidence: number;
  selected: boolean;
}

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');

  const mockDetectedIngredients: DetectedIngredient[] = [
    { name: 'Tomatoes', confidence: 95, selected: true },
    { name: 'Bell Peppers', confidence: 88, selected: true },
    { name: 'Onions', confidence: 92, selected: true },
    { name: 'Garlic', confidence: 78, selected: true },
    { name: 'Spinach', confidence: 85, selected: false },
    { name: 'Mushrooms', confidence: 82, selected: true },
  ];

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = () => {
    if (!permission?.granted) {
      Alert.alert('Camera Permission', 'Camera permission is required to scan ingredients.');
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
      setDetectedIngredients(mockDetectedIngredients);
    }, 3000);
  };

  const handleRetry = () => {
    setHasScanned(false);
    setDetectedIngredients([]);
    setIsScanning(false);
  };

  const toggleIngredient = (index: number) => {
    setDetectedIngredients(prev =>
      prev.map((ingredient, i) =>
        i === index ? { ...ingredient, selected: !ingredient.selected } : ingredient
      )
    );
  };

  const selectedCount = detectedIngredients.filter(ing => ing.selected).length;

  const handleGenerateRecipe = () => {
    router.push('/recipes');
  };

  const handleBack = () => {
    router.back();
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Ingredient Scanner</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE DETECTION</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {!hasScanned ? (
        <View style={styles.cameraContainer}>
          {isScanning ? (
            <CameraView style={styles.camera} facing={facing} />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Camera size={64} color="#9ca3af" />
              <Text style={styles.cameraPlaceholderTitle}>Ready to scan</Text>
              <Text style={styles.cameraPlaceholderText}>
                Point your camera at ingredients to identify them
              </Text>
            </View>
          )}

          <View style={styles.scanningOverlay}>
            <View style={styles.scanningFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {isScanning && (
                <View style={styles.scanningContent}>
                  <Zap size={32} color="#10b981" />
                  <Text style={styles.scanningText}>Scanning ingredients...</Text>
                </View>
              )}
            </View>
          </View>

          {!isScanning && (
            <View style={styles.instructions}>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionText}>
                  💡 For best results, ensure good lighting and place ingredients clearly in view
                </Text>
              </View>
            </View>
          )}

          <View style={styles.scanButtonContainer}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <View style={styles.loadingSpinner} />
              ) : (
                <Camera size={32} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.resultsContent}>
            <View style={styles.resultsHeader}>
              <View style={styles.successIcon}>
                <Check size={32} color="#10b981" />
              </View>
              <Text style={styles.resultsTitle}>Ingredients detected!</Text>
              <Text style={styles.resultsSubtitle}>
                We found {detectedIngredients.length} ingredients. Select what you have:
              </Text>
            </View>

            <View style={styles.ingredientsList}>
              {detectedIngredients.map((ingredient, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.ingredientItem,
                    ingredient.selected && styles.ingredientItemSelected,
                  ]}
                  onPress={() => toggleIngredient(index)}
                >
                  <View style={styles.ingredientContent}>
                    <View style={styles.ingredientInfo}>
                      <View
                        style={[
                          styles.checkbox,
                          ingredient.selected && styles.checkboxSelected,
                        ]}
                      >
                        {ingredient.selected && (
                          <Check size={12} color="white" />
                        )}
                      </View>
                      <View style={styles.ingredientDetails}>
                        <Text style={styles.ingredientName}>{ingredient.name}</Text>
                        <Text style={styles.ingredientConfidence}>
                          {ingredient.confidence}% confidence
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.confidenceBadge,
                        {
                          backgroundColor: ingredient.confidence > 85 ? '#dcfce7' : '#f3f4f6',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.confidenceBadgeText,
                          {
                            color: ingredient.confidence > 85 ? '#166534' : '#6b7280',
                          },
                        ]}
                      >
                        {ingredient.confidence > 85 ? 'High' : 'Medium'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  selectedCount === 0 && styles.generateButtonDisabled,
                ]}
                onPress={handleGenerateRecipe}
                disabled={selectedCount === 0}
              >
                <Text style={styles.generateButtonText}>
                  Generate Recipe ({selectedCount} ingredients)
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <RotateCcw size={20} color="#6b7280" />
                <Text style={styles.retryButtonText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#1a4431',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  liveText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 48,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cameraPlaceholderTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  cameraPlaceholderText: {
    color: '#d1d5db',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningFrame: {
    width: 320,
    height: 320,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#10b981',
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanningContent: {
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
  },
  instructionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 16,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  scanButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: '#e5e7eb',
    borderTopColor: '#10b981',
    borderRadius: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  resultsContent: {
    padding: 24,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  ingredientsList: {
    gap: 12,
    marginBottom: 24,
  },
  ingredientItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  ingredientItemSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  ingredientContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  ingredientDetails: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ingredientConfidence: {
    fontSize: 14,
    color: '#9ca3af',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  generateButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  retryButtonText: {
    color: '#6b7280',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});