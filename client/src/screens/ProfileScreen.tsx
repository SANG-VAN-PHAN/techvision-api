import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useStore();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </View>
        <View style={styles.authSection}>
          <Ionicons name="person-circle-outline" size={100} color="#D2D2D7" />
          <Text style={styles.authTitle}>Đăng nhập TechVision</Text>
          <Text style={styles.authSubtitle}>Đăng nhập để truy cập đơn hàng, ưu đãi và nhiều hơn nữa</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerBtnText}>Tạo tài khoản</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="bag-handle-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Đơn hàng của tôi</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="heart-outline" size={22} color="#FF3B30" />
            </View>
            <Text style={styles.menuText}>Danh sách yêu thích</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="location-outline" size={22} color="#34C759" />
            </View>
            <Text style={styles.menuText}>Địa chỉ giao hàng</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="card-outline" size={22} color="#FF9500" />
            </View>
            <Text style={styles.menuText}>Phương thức thanh toán</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="ticket-outline" size={22} color="#5856D6" />
            </View>
            <Text style={styles.menuText}>Mã giảm giá của tôi</Text>
            <View style={styles.couponBadge}>
              <Text style={styles.couponBadgeText}>3</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={22} color="#1D1D1F" />
            </View>
            <Text style={styles.menuText}>Thông báo</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="settings-outline" size={22} color="#1D1D1F" />
            </View>
            <Text style={styles.menuText}>Cài đặt</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle-outline" size={22} color="#1D1D1F" />
            </View>
            <Text style={styles.menuText}>Trung tâm hỗ trợ</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Ionicons name="document-text-outline" size={22} color="#1D1D1F" />
            </View>
            <Text style={styles.menuText}>Điều khoản sử dụng</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>TechVision v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  userEmail: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#1D1D1F',
  },
  couponBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  couponBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#C7C7CC',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  // Auth Section (not logged in)
  authSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 20,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#6E6E73',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  loginBtn: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  registerBtnText: {
    color: '#0066FF',
    fontSize: 16,
    fontWeight: '600',
  },
});
