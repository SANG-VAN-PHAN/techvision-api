import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addToCart } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.productImage}>
        <Text style={styles.productEmoji}>{item.icon}</Text>
        {item.badge && (
          <View style={[styles.badge, item.badge === 'sale' && styles.badgeSale]}>
            <Text style={styles.badgeText}>{item.badgeText}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => addToCart(item)}
        >
          <Ionicons name="heart-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          {item.oldPrice && (
            <Text style={styles.oldPrice}>{formatPrice(item.oldPrice)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#86868B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#86868B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Filter */}
      <FlatList
        horizontal
        data={[{ id: null, name: 'Tất cả', icon: '📦' }, ...CATEGORIES]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === item.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.categoryChipText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilter}
      />

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={60} color="#D2D2D7" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8ED',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8ED',
  },
  categoryChipActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  productGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '48%',
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    height: 160,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productEmoji: {
    fontSize: 60,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0066FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSale: {
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 10,
    color: '#0066FF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 4,
    height: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  oldPrice: {
    fontSize: 12,
    color: '#6E6E73',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  stars: {
    color: '#FFD60A',
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#1D1D1F',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6E6E73',
    marginTop: 16,
  },
});
