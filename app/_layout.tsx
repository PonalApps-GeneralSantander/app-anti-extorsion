import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

// Colombian Police colors
const COLORS = {
  primary: '#00457C', // Police blue
  secondary: '#008F39', // Police green
  accent: '#F6B40E', // Colombian flag yellow
  light: '#FFFFFF',
  dark: '#002855',
  grey: '#E6E6E6',
  danger: '#D32F2F'
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    'RobotoCondensed-Regular': require('../assets/fonts/Roboto_Condensed-Regular.ttf'),
    'RobotoCondensed-Bold': require('../assets/fonts/Roboto_Condensed-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: COLORS.light,
          borderTopColor: COLORS.grey,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.light,
        headerTitleStyle: {
          fontFamily: 'RobotoCondensed-Bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => <FontAwesome5 name="bell" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reportar"
        options={{
          title: 'Reportar',
          tabBarIcon: ({ color }) => <FontAwesome5 name="exclamation-triangle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="grabacion"
        options={{
          title: 'Grabación',
          tabBarIcon: ({ color }) => <FontAwesome5 name="microphone" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recursos"
        options={{
          title: 'Recursos',
          tabBarIcon: ({ color }) => <FontAwesome5 name="info-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 