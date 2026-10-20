import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { register, isLoading } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !phone || !address || !city) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (!/^0[0-9]{9,10}$/.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ! Phải bắt đầu bằng 0 và có 10-11 số.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (!agreed) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng!');
      return;
    }

    try {
      await register({
        name,
        email,
        phone,
        password,
        address,
        city,
        district,
      });
      Alert.alert(
        'Thành công',
        'Tài khoản đã được tạo! Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng ký</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Đăng ký để nhận nhiều ưu đãi</Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên <Text style={{color:'#FF3B30'}}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#86868B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên của bạn"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email <Text style={{color:'#FF3B30'}}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#86868B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại <Text style={{color:'#FF3B30'}}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#86868B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0xxxxxxxxx (10-11 số)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ <Text style={{color:'#FF3B30'}}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#86868B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Số nhà, đường, phường/xã"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* City / District */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Thành phố / Tỉnh <Text style={{color:'#FF3B30'}}>*</Text></Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#86868B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="TP.HCM / HN / ..."
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Quận / Huyện</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="map-outline" size={20} color="#86868B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Quận 1, ..."
                    value={district}
                    onChangeText={setDistrict}
                  />
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu <Text style={{color:'#FF3B30'}}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#86868B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ít nhất 6 ký tự"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#86868B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu <Text style={{color:'#FF3B30'}}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#86868B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            {/* Terms Agreement */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
                {' '}và{' '}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerBtn, (!agreed || isLoading) && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={!agreed || isLoading}
            >
              <Text style={styles.registerBtnText}>
                {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  form: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 15,
    color: '#6E6E73',
    marginTop: 8,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8ED',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1D1D1F',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E8E8ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#6E6E73',
    lineHeight: 20,
  },
  termsLink: {
    color: '#0066FF',
  },
  registerBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerBtnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#6E6E73',
    fontSize: 14,
  },
  loginLink: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
