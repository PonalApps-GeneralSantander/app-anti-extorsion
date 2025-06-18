import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import AppButton from './AppButton';
import { ReportsService } from '../services/reportsService';

interface ReportStatusModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ReportStatusData {
  reportId: string;
  caseNumber: string;
  status: string;
}

export default function ReportStatusModal({ visible, onClose }: ReportStatusModalProps) {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'case' | 'id'>('case');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportStatusData | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      Alert.alert('Error', 'Por favor ingrese un número de caso o ID de reporte');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (searchType === 'case') {
        response = await ReportsService.getReportByCaseNumber(searchValue.trim());
      } else {
        response = await ReportsService.getReportStatus(searchValue.trim());
      }

      if (response.success && response.data) {
        setReportData(response.data);
      } else {
        throw new Error(response.message || 'Reporte no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar reporte:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('no encontrado') || errorMessage.includes('not found')) {
        Alert.alert(
          'Reporte No Encontrado',
          'No se encontró ningún reporte con los datos proporcionados. Verifique el número de caso o ID e intente nuevamente.'
        );
      } else {
        Alert.alert(
          'Error',
          'Ocurrió un error al consultar el reporte. Por favor intente nuevamente.'
        );
      }
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchValue('');
    setReportData(null);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Colors.warning;
      case 'IN_REVIEW':
        return Colors.primary;
      case 'RESOLVED':
        return Colors.success;
      case 'CLOSED':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente de Revisión';
      case 'IN_REVIEW':
        return 'En Investigación';
      case 'RESOLVED':
        return 'Resuelto';
      case 'CLOSED':
        return 'Cerrado';
      default:
        return status;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.title}>Consultar Estado de Reporte</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.searchTypeContainer}>
            <Text style={styles.label}>Buscar por:</Text>
            <View style={styles.searchTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === 'case' && styles.searchTypeButtonActive
                ]}
                onPress={() => setSearchType('case')}
              >
                <Text
                  style={[
                    styles.searchTypeButtonText,
                    searchType === 'case' && styles.searchTypeButtonTextActive
                  ]}
                >
                  Número de Caso
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === 'id' && styles.searchTypeButtonActive
                ]}
                onPress={() => setSearchType('id')}
              >
                <Text
                  style={[
                    styles.searchTypeButtonText,
                    searchType === 'id' && styles.searchTypeButtonTextActive
                  ]}
                >
                  ID de Reporte
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {searchType === 'case' ? 'Número de Caso' : 'ID de Reporte'}
            </Text>
            <View style={styles.searchInputContainer}>
              <FontAwesome5 name="search" size={16} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder={searchType === 'case' ? 'Ej: EXT-2024-000001' : 'Ej: a1b2c3d4-e5f6-7890...'}
                autoCapitalize="none"
              />
            </View>
          </View>

          <AppButton
            title="Buscar Reporte"
            onPress={handleSearch}
            loading={loading}
            disabled={loading || !searchValue.trim()}
            style={styles.searchButton}
          />

          {reportData && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <FontAwesome5 name="file-alt" size={24} color={Colors.primary} />
                <Text style={styles.resultTitle}>Información del Reporte</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Número de Caso:</Text>
                <Text style={styles.resultValue}>{reportData.caseNumber}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>ID de Reporte:</Text>
                <Text style={styles.resultValueSmall}>{reportData.reportId}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Estado:</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(reportData.status) }
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(reportData.status) }
                    ]}
                  >
                    {getStatusText(reportData.status)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Consultando reporte...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
    backgroundColor: Colors.light,
  },
  closeButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchTypeContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  searchTypeButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light,
    alignItems: 'center',
  },
  searchTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  searchTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchTypeButtonTextActive: {
    color: Colors.light,
  },
  inputGroup: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  searchButton: {
    marginBottom: 24,
  },
  resultContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
  resultItem: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  resultValueSmall: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
}); 