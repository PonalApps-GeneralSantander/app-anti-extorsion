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
  phoneNumber?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
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
    setReportData(null); // Limpiar datos anteriores
    
    try {
      console.log(`🔍 Buscando reporte por ${searchType}:`, searchValue.trim());
      
      let response;
      
      if (searchType === 'case') {
        response = await ReportsService.getReportByCaseNumber(searchValue.trim());
      } else {
        response = await ReportsService.getReportStatus(searchValue.trim());
      }

      console.log('📥 Respuesta de la API:', response);

      // Manejar diferentes formatos de respuesta
      let reportInfo = null;
      
      if (response && typeof response === 'object') {
        // Si la respuesta tiene un campo 'data'
        if (response.data) {
          reportInfo = response.data;
        }
        // Si la respuesta es directamente el objeto del reporte
        else if (response.id || response.caseNumber) {
          reportInfo = response;
        }
        // Si hay un array de reportes, tomar el primero
        else if (Array.isArray(response) && response.length > 0) {
          reportInfo = response[0];
        }
      }

      if (reportInfo) {
        // Formatear los datos para el modal
        const formattedData = {
          reportId: reportInfo.id || reportInfo.reportId || 'N/A',
          caseNumber: reportInfo.caseNumber || reportInfo.case_number || 'N/A',
          status: reportInfo.status || 'UNKNOWN',
          phoneNumber: reportInfo.phoneNumber || reportInfo.phone_number || 'N/A',
          description: reportInfo.description || 'Sin descripción',
          createdAt: reportInfo.createdAt || reportInfo.created_at || reportInfo.incidentDate,
          updatedAt: reportInfo.updatedAt || reportInfo.updated_at,
        };
        
        console.log('✅ Datos formateados para mostrar:', formattedData);
        setReportData(formattedData);
        
        // Mostrar notificación de éxito
        Alert.alert(
          'Reporte Encontrado',
          `Se encontró el reporte con caso: ${formattedData.caseNumber}`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('No se encontró información del reporte');
      }
      
    } catch (error) {
      console.error('💥 Error al buscar reporte:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('no encontrado') || 
          errorMessage.includes('not found') || 
          errorMessage.includes('404')) {
        Alert.alert(
          'Reporte No Encontrado',
          `No se encontró ningún reporte con ${searchType === 'case' ? 'el número de caso' : 'el ID'}: "${searchValue.trim()}"\n\nVerifique los datos e intente nuevamente.`
        );
      } else if (errorMessage.includes('Network Error') || 
                 errorMessage.includes('timeout')) {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.'
        );
      } else {
        Alert.alert(
          'Error',
          `Ocurrió un error al consultar el reporte:\n${errorMessage}\n\nPor favor intente nuevamente.`
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

  const generateTestData = () => {
    const statuses = ['PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];
    const phoneNumbers = ['+57 300 123 4567', '+57 310 987 6543', '+57 320 555 0123'];
    const descriptions = [
      'Llamada de extorsión solicitando dinero con amenazas',
      'Intento de estafa telefónica haciéndose pasar por banco',
      'Amenazas por cobro de deuda inexistente',
      'Extorsión con supuestas fotos comprometedoras'
    ];
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomPhone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Últimos 30 días
    
    return {
      reportId: `test-${Math.random().toString(36).substr(2, 9)}`,
      caseNumber: `EXT-2024-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      status: randomStatus,
      phoneNumber: randomPhone,
      description: randomDescription,
      createdAt: randomDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };
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
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Cómo Usar Esta Función',
                '• Número de Caso: Formato EXT-YYYY-NNNNNN (ej: EXT-2024-000123)\n\n• ID de Reporte: Identificador único del reporte\n\n• Use "Generar Datos de Ejemplo" para probar la funcionalidad\n\n• Los datos se conectan automáticamente al servidor cuando esté disponible',
                [{ text: 'Entendido' }]
              );
            }}
            style={styles.helpButton}
          >
            <FontAwesome5 name="question-circle" size={20} color={Colors.primary} />
          </TouchableOpacity>
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
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity 
                onPress={handleSearch}
                disabled={loading || !searchValue.trim()}
                style={[
                  styles.searchIconButton,
                  (!searchValue.trim() || loading) && styles.searchIconButtonDisabled
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <FontAwesome5 
                    name="arrow-right" 
                    size={14} 
                    color={(!searchValue.trim() || loading) ? Colors.textSecondary : Colors.primary} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            disabled={loading || !searchValue.trim()}
            style={[
              styles.alternativeSearchButton,
              (loading || !searchValue.trim()) && styles.alternativeSearchButtonDisabled
            ]}
          >
            <FontAwesome5 name="search" size={16} color={Colors.primary} />
            <Text style={styles.alternativeSearchButtonText}>
              {loading ? 'Buscando...' : 'Buscar Reporte'}
            </Text>
            {loading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              const testData = generateTestData();
              setReportData(testData);
              Alert.alert(
                'Datos de Prueba Generados',
                `Se generó un reporte de ejemplo:\nCaso: ${testData.caseNumber}\nEstado: ${getStatusText(testData.status)}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <FontAwesome5 name="flask" size={16} color={Colors.secondary} />
            <Text style={styles.testButtonText}>Generar Datos de Ejemplo</Text>
          </TouchableOpacity>

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

              {reportData.phoneNumber && reportData.phoneNumber !== 'N/A' && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Número Reportado:</Text>
                  <Text style={styles.resultValue}>{reportData.phoneNumber}</Text>
                </View>
              )}

              {reportData.description && reportData.description !== 'Sin descripción' && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Descripción:</Text>
                  <Text style={styles.resultDescription}>{reportData.description}</Text>
                </View>
              )}

              {reportData.createdAt && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Fecha de Creación:</Text>
                  <Text style={styles.resultValue}>
                    {new Date(reportData.createdAt).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              )}

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert(
                      'Información Completa',
                      `Caso: ${reportData.caseNumber}\nID: ${reportData.reportId}\nEstado: ${getStatusText(reportData.status)}\nTeléfono: ${reportData.phoneNumber || 'N/A'}\n\nDescripción:\n${reportData.description || 'Sin descripción'}`,
                      [{ text: 'Cerrar' }]
                    );
                  }}
                >
                  <FontAwesome5 name="info-circle" size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setSearchValue('');
                    setReportData(null);
                  }}
                >
                  <FontAwesome5 name="search" size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Nueva Búsqueda</Text>
                </TouchableOpacity>
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
  resultDescription: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  helpButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchIconButton: {
    padding: 12,
    backgroundColor: Colors.backgroundLight,
    borderLeftWidth: 1,
    borderLeftColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  searchIconButtonDisabled: {
    opacity: 0.5,
  },
  alternativeSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  alternativeSearchButtonDisabled: {
    opacity: 0.5,
    borderColor: Colors.textSecondary,
  },
  alternativeSearchButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
}); 