import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PRODUCTS } from '../data/products';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const results = searchQuery.length > 0
    ? PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.productImage}>
        <Text style={styles.productEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#86868B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#86868B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {searchQuery.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={60} color="#D2D2D7" />
              <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Tìm kiếm phổ biến</Text>
          <View style={styles.tagsContainer}>
            {['iPhone 16', 'MacBook', 'AirPods', 'Samsung', 'Xiaomi'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => setSearchQuery(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    marginLeft: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  resultsList: {
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: {
    fontSize: 36,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  productBrand: {
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066FF',
    marginTop: 8,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6E6E73',
    marginTop: 16,
  },
  suggestions: {
    padding: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8ED',
  },
  tagText: {
    fontSize: 14,
    color: '#1D1D1F',
  },
});
