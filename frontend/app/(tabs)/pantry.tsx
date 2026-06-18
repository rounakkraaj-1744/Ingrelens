import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {
  Plus,
  Search,
  ShoppingCart,
  Package,
  Calendar,
  AlertTriangle,
  Check,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

export default function PantryScreen() {
  const { pantryItems, profile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pantry' | 'shopping'>('pantry');

  const shoppingList = [
    ...pantryItems
      .filter((item) => item.status !== 'fresh')
      .map((item, index) => ({
        id: `${item.id}-${index}`,
        name: item.name,
        category: item.category,
        needed: true,
      })),
    {
      id: 'goal-protein',
      name: profile.fitnessGoal === 'cut' ? 'Greek Yogurt' : 'Chicken Breast',
      category: 'Protein',
      needed: true,
    },
    {
      id: 'goal-carb',
      name: profile.fitnessGoal === 'bulk' ? 'Quinoa' : 'Brown Rice',
      category: 'Grains',
      needed: profile.fitnessGoal !== 'maintain',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return '#10b981';
      case 'expiring': return '#f59e0b';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return <Check size={16} color="#10b981" />;
      case 'expiring': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'expired': return <AlertTriangle size={16} color="#ef4444" />;
      default: return <Package size={16} color="#6b7280" />;
    }
  };

  const filteredItems = pantryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Pantry</Text>
        <Text style={styles.headerSubtitle}>
          {profile.email ? 'Track ingredients and plan shopping' : 'Your pantry will appear after you add items'}
        </Text>
        
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'pantry' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('pantry')}
          >
            <Package size={20} color={activeTab === 'pantry' ? 'white' : '#6b7280'} />
            <Text
              style={[
                styles.tabText,
                activeTab === 'pantry' && styles.activeTabText,
              ]}
            >
              Pantry
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'shopping' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('shopping')}
          >
            <ShoppingCart size={20} color={activeTab === 'shopping' ? 'white' : '#6b7280'} />
            <Text
              style={[
                styles.tabText,
                activeTab === 'shopping' && styles.activeTabText,
              ]}
            >
              Shopping
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'pantry' ? (
            <View style={styles.pantryContent}>
              <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Package size={24} color="#1a4431" />
                </View>
                <Text style={styles.statNumber}>{pantryItems.length}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <AlertTriangle size={24} color="#f59e0b" />
                </View>
                <Text style={styles.statNumber}>
                  {pantryItems.filter(item => item.status === 'expiring').length}
                </Text>
                <Text style={styles.statLabel}>Expiring Soon</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Calendar size={24} color="#ef4444" />
                </View>
                <Text style={styles.statNumber}>
                  {pantryItems.filter(item => item.status === 'expired').length}
                </Text>
                <Text style={styles.statLabel}>Expired</Text>
              </View>
            </View>

            {/* Pantry Items */}
            <View style={styles.itemsList}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Ingredients</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Smart summary</Text>
                <Text style={styles.summaryText}>
                  {pantryItems.length > 0
                    ? `${pantryItems.filter(item => item.status === 'expiring').length} items need attention and ${pantryItems.filter(item => item.status === 'fresh').length} are ready to use.`
                    : 'No pantry items yet. Add your first scan to begin tracking.'}
                </Text>
              </View>

              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <View key={item.id} style={styles.pantryItem}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {getStatusIcon(item.status)}
                      </View>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      <Text style={styles.itemQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <View style={styles.itemMeta}>
                      <Text style={styles.expiryLabel}>Expires</Text>
                      <Text
                        style={[
                          styles.expiryDate,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              )) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No pantry items</Text>
                  <Text style={styles.emptyStateText}>Scan ingredients or add items manually to start building your pantry.</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.shoppingContent}>
            <View style={styles.shoppingHeader}>
              <Text style={styles.sectionTitle}>Shopping List</Text>
              <View style={styles.shoppingStats}>
                <Text style={styles.shoppingStatsText}>
                  {shoppingList.filter(item => item.needed).length} items needed
                </Text>
              </View>
            </View>

            <View style={styles.shoppingList}>
              {shoppingList.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>Shopping list is empty</Text>
                  <Text style={styles.emptyStateText}>Your shopping suggestions will appear after you add pantry items or set a goal.</Text>
                </View>
              ) : null}
              {shoppingList.map((item) => (
                <View key={item.id} style={styles.shoppingItem}>
                  <View style={styles.shoppingItemContent}>
                    <View
                      style={[
                        styles.checkbox,
                        !item.needed && styles.checkboxChecked,
                      ]}
                    >
                      {!item.needed && <Check size={16} color="white" />}
                    </View>
                    <View style={styles.shoppingItemInfo}>
                      <Text
                        style={[
                          styles.shoppingItemName,
                          !item.needed && styles.shoppingItemNameCompleted,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.shoppingItemCategory}>{item.category}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.addToShoppingButton}>
              <Plus size={20} color="white" />
              <Text style={styles.addToShoppingButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#1a4431',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  pantryContent: {
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  itemsList: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#edf7f1',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cde6d7',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4431',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#1a4431',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pantryItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  shoppingContent: {
    paddingBottom: 100,
  },
  shoppingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  shoppingStats: {
    backgroundColor: '#1a4431',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shoppingStatsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  shoppingList: {
    gap: 12,
    marginBottom: 32,
  },
  shoppingItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shoppingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  shoppingItemInfo: {
    flex: 1,
  },
  shoppingItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  shoppingItemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  shoppingItemCategory: {
    fontSize: 14,
    color: '#6b7280',
  },
  addToShoppingButton: {
    backgroundColor: '#1a4431',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#1a4431',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addToShoppingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
