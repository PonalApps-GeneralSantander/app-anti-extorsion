import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  warning: '#FF9800',
  success: '#4CAF50',
};

type RiskLevel = 'high' | 'medium' | 'low';

interface SuspiciousCallCardProps {
  phoneNumber: string;
  date: string;
  time: string;
  riskLevel: RiskLevel;
  description?: string;
  reportCount?: number;
  lastReported?: string;
  onPress?: () => void;
}

export default function SuspiciousCallCard({
  phoneNumber,
  date,
  time,
  riskLevel,
  description,
  reportCount,
  lastReported,
  onPress,
}: SuspiciousCallCardProps) {
  
  const getRiskLevelColor = () => {
    switch (riskLevel) {
      case 'high':
        return COLORS.danger;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.warning;
    }
  };

  const getRiskLevelText = () => {
    switch (riskLevel) {
      case 'high':
        return 'Alto riesgo';
      case 'medium':
        return 'Riesgo medio';
      case 'low':
        return 'Riesgo bajo';
      default:
        return 'Riesgo desconocido';
    }
  };

  const getRiskLevelIcon = () => {
    switch (riskLevel) {
      case 'high':
        return 'exclamation-triangle';
      case 'medium':
        return 'exclamation-circle';
      case 'low':
        return 'info-circle';
      default:
        return 'question-circle';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.phoneContainer}>
          <FontAwesome5 
            name="phone" 
            size={16} 
            color={COLORS.primary} 
            style={styles.phoneIcon} 
          />
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: getRiskLevelColor() }]}>
          <FontAwesome5 
            name={getRiskLevelIcon()} 
            size={12} 
            color={COLORS.light} 
          />
          <Text style={styles.riskText}>{getRiskLevelText()}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <FontAwesome5 
            name="calendar-alt" 
            size={14} 
            color={COLORS.primary} 
            style={styles.infoIcon} 
          />
          <Text style={styles.infoText}>{date}</Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome5 
            name="clock" 
            size={14} 
            color={COLORS.primary} 
            style={styles.infoIcon} 
          />
          <Text style={styles.infoText}>{time}</Text>
        </View>
      </View>

      {(reportCount || lastReported) && (
        <View style={styles.statsContainer}>
          {reportCount && (
            <View style={styles.statItem}>
              <FontAwesome5 
                name="flag" 
                size={12} 
                color={COLORS.danger} 
                style={styles.statIcon} 
              />
              <Text style={styles.statText}>{reportCount} reportes</Text>
            </View>
          )}
          {lastReported && (
            <View style={styles.statItem}>
              <FontAwesome5 
                name="clock" 
                size={12} 
                color={COLORS.warning} 
                style={styles.statIcon} 
              />
              <Text style={styles.statText}>{lastReported}</Text>
            </View>
          )}
        </View>
      )}

      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIcon: {
    marginRight: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: COLORS.light,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: '600',
  },
}); 