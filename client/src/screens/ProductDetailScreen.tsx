import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { PRODUCTS } from '../data/products';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type RouteProps = RouteProp<RootStackParamList, 'ProductDetail'>;
const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { addToCart, cart } = useStore();
  
  const product = PRODUCTS.find(p => p.id === route.params.productId);
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const cartItem = cart.find(c => c.product.id === product.id);
  const inCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="share-outline" size={24} color="#1D1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Text style={styles.productEmoji}>{product.icon}</Text>
          {product.badge && (
            <View style={[styles.badge, product.badge === 'sale' && styles.badgeSale]}>
              <Text style={styles.badgeText}>{product.badgeText}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.reviews} đánh giá)</Text>
            <Text style={styles.sold}>| Đã bán {product.sold}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.oldPrice && (
              <>
                <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 3D View Button */}
        <TouchableOpacity style={styles.view3DBtn} onPress={() => setShow3D(true)}>
          <Ionicons name="cube-outline" size={24} color="#0066FF" />
          <Text style={styles.view3DText}>Xem sản phẩm 3D</Text>
          <Ionicons name="chevron-forward" size={20} color="#0066FF" />
        </TouchableOpacity>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặc điểm nổi bật</Text>
          <View style={styles.featuresGrid}>
            {product.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
          {product.specifications?.map((spec, index) => (
            <View key={index} style={styles.specRow}>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add" size={24} color="#1D1D1F" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            Thêm vào giỏ {inCart > 0 && `(${inCart})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* 3D Modal */}
      <Modal visible={show3D} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Xem 3D: {product.name}</Text>
            <TouchableOpacity onPress={() => setShow3D(false)}>
              <Ionicons name="close" size={28} color="#1D1D1F" />
            </TouchableOpacity>
          </View>
          <View style={styles.modal3DViewer}>
            <Text style={styles.modal3DText}>3D Viewer</Text>
            <Text style={styles.modal3DSubtext}>
              {product.icon} {'\n\n'}
              Mô hình 3D của {'\n'}
              {product.name}
            </Text>
            <Text style={styles.modal3DNote}>
              (Kết nối Three.js/D3D để hiển thị 3D)
            </Text>
          </View>
          <View style={styles.modalControls}>
            <TouchableOpacity style={styles.modalBtn}>
              <Ionicons name="refresh" size={20} color="#0066FF" />
              <Text style={styles.modalBtnText}>Auto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn}>
              <Ionicons name="grid-outline" size={20} color="#0066FF" />
              <Text style={styles.modalBtnText}>Wireframe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn}>
              <Ionicons name="eye-outline" size={20} color="#0066FF" />
              <Text style={styles.modalBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: {
    fontSize: 120,
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#0066FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeSale: {
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  brand: {
    fontSize: 12,
    color: '#0066FF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  stars: {
    color: '#FFD60A',
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  reviews: {
    fontSize: 13,
    color: '#6E6E73',
    marginLeft: 6,
  },
  sold: {
    fontSize: 13,
    color: '#6E6E73',
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0066FF',
  },
  oldPrice: {
    fontSize: 16,
    color: '#6E6E73',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  view3DBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  view3DText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0066FF',
    marginLeft: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6E6E73',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginLeft: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  specLabel: {
    fontSize: 14,
    color: '#6E6E73',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8ED',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066FF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 12,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  buyNowBtn: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  modal3DViewer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal3DText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modal3DSubtext: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 16,
  },
  modal3DNote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 24,
  },
  modalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
});
