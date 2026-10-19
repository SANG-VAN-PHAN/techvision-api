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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { login, loginWithGoogle, loginWithFacebook, isLoading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      await login(email, password);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại!');
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
          <Text style={styles.headerTitle}>Đăng nhập</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Chào mừng bạn!</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <TouchableOpacity style={styles.socialBtn} onPress={loginWithGoogle}>
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text style={styles.socialBtnText}>Đăng nhập với Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={loginWithFacebook}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={styles.socialBtnText}>Đăng nhập với Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
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

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#86868B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
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

          <TouchableOpacity style={styles.forgotLink}>
            <Text style={styles.forgotLinkText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginBtnText}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.replace('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flex: 1,
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
  socialSection: {
    gap: 12,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E8ED',
    borderRadius: 12,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1D1F',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8ED',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#86868B',
    fontSize: 14,
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotLinkText: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '500',
  },
  loginBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6E6E73',
    fontSize: 14,
  },
  registerLink: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
