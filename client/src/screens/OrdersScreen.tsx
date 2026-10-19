import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.emptyState}>
        <Ionicons name="bag-handle-outline" size={80} color="#D2D2D7" />
        <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
        <Text style={styles.emptySubtitle}>Bắt đầu mua sắm để tạo đơn hàng</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('Main' as any)}
        >
          <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 8,
    textAlign: 'center',
  },
  shopBtn: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
