import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, cart } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('Category', { categoryId: item.id, name: item.name })}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count}</Text>
    </TouchableOpacity>
  );

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
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productRating}>
          <Text style={styles.stars}>★</Text>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          {item.oldPrice && (
            <Text style={styles.oldPrice}>{formatPrice(item.oldPrice)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>⚡</Text>
          <Text style={styles.logoText}>TechVision</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: '1' })}>
          <View>
            <Ionicons name="notifications-outline" size={24} color="#1D1D1F" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Khám phá thế giới</Text>
          <Text style={styles.heroTitle}>công nghệ đỉnh cao</Text>
          <Text style={styles.heroSubtitle}>Trải nghiệm sản phẩm với công nghệ 3D</Text>
          <TouchableOpacity style={styles.heroBtn}>
            <Text style={styles.heroBtnText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Products' } as any)}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={PRODUCTS}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* Best Sellers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bán chạy nhất</Text>
          </View>
          <FlatList
            horizontal
            data={PRODUCTS.filter(p => p.sold > 500)}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  hero: {
    backgroundColor: '#F5F5F7',
    padding: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6E6E73',
    marginTop: 8,
  },
  heroBtn: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  seeAll: {
    color: '#0066FF',
    fontWeight: '500',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    width: 90,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 10,
    color: '#6E6E73',
    marginTop: 4,
  },
  productList: {
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 6,
    width: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    height: 140,
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
  productRating: {
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
  },
  reviews: {
    fontSize: 11,
    color: '#6E6E73',
    marginLeft: 4,
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
});
