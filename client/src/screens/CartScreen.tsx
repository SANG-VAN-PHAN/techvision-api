import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useStore();

  const shippingFee = cartTotal >= 500000 ? 0 : 30000;
  const total = cartTotal + shippingFee;

  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImage}>
        <Text style={styles.itemEmoji}>{item.product.icon}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemBrand}>{item.product.brand}</Text>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateCartQuantity(item.product.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={18} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateCartQuantity(item.product.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={18} color="#1D1D1F" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color="#D2D2D7" />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm vào giỏ hàng</Text>
          <TouchableOpacity
            style={styles.shoppingBtn}
            onPress={() => navigation.navigate('Main' as any)}
          >
            <Text style={styles.shoppingBtnText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng ({cart.length})</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            'Xóa giỏ hàng',
            'Bạn có chắc muốn xóa tất cả sản phẩm?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: clearCart },
            ]
          );
        }}>
          <Text style={styles.clearBtn}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomSection}>
        {/* Coupon */}
        <View style={styles.couponSection}>
          <Ionicons name="pricetag-outline" size={20} color="#0066FF" />
          <Text style={styles.couponText}>Nhập mã giảm giá</Text>
          <Ionicons name="chevron-forward" size={18} color="#6E6E73" />
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
            </Text>
          </View>
          {shippingFee > 0 && (
            <Text style={styles.freeShipNote}>
              Mua thêm {formatPrice(500000 - cartTotal)} để được miễn phí vận chuyển
            </Text>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutBtnText}>Thanh toán ngay</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  clearBtn: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 36,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemBrand: {
    fontSize: 10,
    color: '#0066FF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 8,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8ED',
    padding: 20,
  },
  couponSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E8ED',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  couponText: {
    flex: 1,
    marginLeft: 10,
    color: '#6E6E73',
    fontSize: 14,
  },
  summary: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6E6E73',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  freeShipNote: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8ED',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0066FF',
  },
  checkoutBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 8,
  },
  shoppingBtn: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  shoppingBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
