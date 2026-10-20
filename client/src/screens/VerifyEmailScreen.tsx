import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useRootNavigation } from 'expo-router';
import { useStore } from '../store/useStore';

export default function VerifyEmailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { setUser } = useStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = route.params?.token;

      if (!token) {
        setStatus('error');
        setMessage('Link xác minh không hợp lệ!');
        return;
      }

      try {
        const API_BASE = 'https://techvision-api.onrender.com/api';
        const res = await fetch(`${API_BASE}/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.message || 'Xác minh thất bại!');
        } else {
          setStatus('success');
          setMessage('Email đã được xác minh thành công! Bây giờ bạn có thể đăng nhập.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Không thể kết nối máy chủ. Vui lòng thử lại.');
      }
    };

    verifyEmail();
  }, [route.params?.token]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#0066FF" />
            <Text style={styles.text}>Đang xác minh email...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.iconCircleSuccess}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Thành công!</Text>
            <Text style={styles.text}>{message}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.buttonText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.iconCircleError}>
              <Ionicons name="close" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Xác minh thất bại</Text>
            <Text style={styles.text}>{message}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.buttonText}>Đăng ký lại</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconCircleSuccess: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircleError: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
