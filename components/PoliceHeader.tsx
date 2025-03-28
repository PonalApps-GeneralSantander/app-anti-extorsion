import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PoliceHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

// Colombian Police colors
const COLORS = {
  primary: '#00457C', // Police blue
  secondary: '#008F39', // Police green
  accent: '#F6B40E', // Colombian flag yellow
  light: '#FFFFFF',
  dark: '#002855',
  grey: '#E6E6E6',
};

export default function PoliceHeader({
  title,
  subtitle,
}: PoliceHeaderProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {/* Flag color bar */}
      <View style={styles.flagStripe}>
        <View style={[styles.flagColor, { backgroundColor: '#FEE94E' }]} />
        <View style={[styles.flagColor, { backgroundColor: '#003893' }]} />
        <View style={[styles.flagColor, { backgroundColor: '#CE1126' }]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.light,
    fontSize: 14,
    opacity: 0.9,
  },
  flagStripe: {
    flexDirection: 'row',
    height: 4,
  },
  flagColor: {
    flex: 1,
    height: '100%',
  },
}); 