import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeStore } from './src/store/useStore';

export default function App() {
  useEffect(() => {
    // Initialize store from AsyncStorage
    initializeStore();
    
    // Register service worker for PWA (web only)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => console.log('SW registered:', registration.scope),
        (error) => console.log('SW registration failed:', error)
      );
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
