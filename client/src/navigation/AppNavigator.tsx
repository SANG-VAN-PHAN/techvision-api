import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoryScreen from '../screens/CategoryScreen';

// Types
export type RootStackParamList = {
  Main: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Login: undefined;
  Register: undefined;
  Search: undefined;
  Category: { categoryId: string; name: string };
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#86868B',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'Sản phẩm' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#1D1D1F',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: 'Chi tiết sản phẩm' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Tìm kiếm' }}
        />
        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Đăng nhập' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Đăng ký' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
