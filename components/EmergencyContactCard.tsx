import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Colombian Police colors
const COLORS = {
  primary: '#00457C', // Police blue
  secondary: '#008F39', // Police green
  accent: '#F6B40E', // Colombian flag yellow
  light: '#FFFFFF',
  dark: '#002855',
  grey: '#E6E6E6',
  danger: '#D32F2F',
};

interface EmergencyContactCardProps {
  title: string;
  phoneNumber: string;
  description?: string;
  icon?: string;
  isPrimary?: boolean;
}

export default function EmergencyContactCard({
  title,
  phoneNumber,
  description,
  icon = 'phone',
  isPrimary = false,
}: EmergencyContactCardProps) {
  
  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isPrimary && styles.primaryContainer
      ]} 
      onPress={handleCall}
      activeOpacity={0.8}
    >
      <View style={[
        styles.iconContainer,
        isPrimary && styles.primaryIconContainer
      ]}>
        <FontAwesome5 
          name={icon} 
          size={24} 
          color={isPrimary ? COLORS.light : COLORS.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[
          styles.title,
          isPrimary && styles.primaryTitle
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.phoneNumber,
          isPrimary && styles.primaryPhoneNumber
        ]}>
          {phoneNumber}
        </Text>
        {description && (
          <Text style={[
            styles.description,
            isPrimary && styles.primaryDescription
          ]}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.callButtonContainer}>
        <View style={[
          styles.callButton,
          isPrimary && styles.primaryCallButton
        ]}>
          <FontAwesome5 
            name="phone" 
            size={16} 
            color={isPrimary ? COLORS.primary : COLORS.light} 
          />
          <Text style={[
            styles.callButtonText,
            isPrimary && styles.primaryCallButtonText
          ]}>
            Llamar
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: 'center',
  },
  primaryContainer: {
    backgroundColor: COLORS.primary,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  primaryIconContainer: {
    backgroundColor: COLORS.accent,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  primaryTitle: {
    color: COLORS.light,
  },
  phoneNumber: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  primaryPhoneNumber: {
    color: COLORS.accent,
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  primaryDescription: {
    color: COLORS.light,
    opacity: 0.9,
  },
  callButtonContainer: {
    marginLeft: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  primaryCallButton: {
    backgroundColor: COLORS.light,
  },
  callButtonText: {
    color: COLORS.light,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  primaryCallButtonText: {
    color: COLORS.primary,
  },
}); 