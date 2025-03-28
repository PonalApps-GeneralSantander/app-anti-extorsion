import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  TouchableOpacityProps,
  ActivityIndicator
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

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

export default function AppButton({ 
  title, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  ...rest 
}: AppButtonProps) {
  
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      default:
        return styles.text;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        getButtonStyles(),
        (disabled || loading) && styles.disabledButton
      ]} 
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.light} />
      ) : (
        <Text style={[
          styles.text, 
          getTextStyles(),
          (disabled || loading) && styles.disabledText
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  }
}); 