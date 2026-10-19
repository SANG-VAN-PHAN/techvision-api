import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PRODUCTS } from '../data/products';
import { RootStackParamList } from '../navigation/AppNavigator';

type RouteProps = RouteProp<RootStackParamList, 'Category'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoryScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();

  const products = PRODUCTS.slice(0, 6); // Sample data

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.params.name}</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#1D1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>{products.length} sản phẩm</Text>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={styles.sortText}>Mới nhất</Text>
          <Ionicons name="chevron-down" size={16} color="#6E6E73" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  resultCount: {
    fontSize: 14,
    color: '#6E6E73',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginRight: 4,
  },
  productGrid: {
    padding: 12,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    height: 140,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productEmoji: {
    fontSize: 50,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0066FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
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
    padding: 10,
  },
  productBrand: {
    fontSize: 10,
    color: '#0066FF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 4,
    height: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  oldPrice: {
    fontSize: 11,
    color: '#6E6E73',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
});
