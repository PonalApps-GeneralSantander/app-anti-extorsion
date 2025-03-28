/**
 * Color palette for the Anti-Extortion App
 * Based on the Colombian Police visual identity
 */

export const Colors = {
  // Primary palette - based on Colombian Police
  primary: '#00457C', // Police blue
  secondary: '#008F39', // Police green
  accent: '#F6B40E', // Colombian flag yellow
  light: '#FFFFFF',
  dark: '#002855',
  grey: '#E6E6E6',
  
  // Extended palette
  danger: '#D32F2F',
  warning: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
  
  // Colombian flag colors
  flagYellow: '#FEE94E',
  flagBlue: '#003893',
  flagRed: '#CE1126',
  
  // Text colors
  textDark: '#11181C',
  textLight: '#FFFFFF',
  textSecondary: '#6C757D',
  
  // Background colors
  backgroundLight: '#FFFFFF',
  backgroundDark: '#F5F7FA',
  backgroundPrimary: '#E8F1F5',
};

// This type ensures type safety when using the colors
export type ColorName = keyof typeof Colors; 