import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import AppButton from '../components/AppButton';
import PoliceHeader from '../components/PoliceHeader';

interface RecordedCall {
  id: string;
  phoneNumber: string;
  date: string;
  time: string;
  duration: string;
  fileSize: string;
}

// Mock data for recorded calls
const RECORDED_CALLS: RecordedCall[] = [
  {
    id: '1',
    phoneNumber: '+57 321 456 7890',
    date: '25/03/2023',
    time: '10:30 AM',
    duration: '3:45',
    fileSize: '2.4 MB',
  },
  {
    id: '2',
    phoneNumber: '+57 300 123 4567',
    date: '23/03/2023',
    time: '3:45 PM',
    duration: '5:20',
    fileSize: '3.1 MB',
  },
  {
    id: '3',
    phoneNumber: '+57 310 789 1234',
    date: '22/03/2023',
    time: '5:20 PM',
    duration: '1:15',
    fileSize: '0.8 MB',
  }
];

export default function GrabacionScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordAllCalls, setRecordAllCalls] = useState(false);
  const [recordSuspiciousCalls, setRecordSuspiciousCalls] = useState(true);
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    // Check if consent was previously given
    // For demo purposes, we'll just show the modal when the screen is first loaded
    if (!consentAccepted) {
      setConsentModalVisible(true);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRecordPress = () => {
    if (!consentAccepted) {
      setConsentModalVisible(true);
      return;
    }
    
    setIsRecording(prev => !prev);
    
    if (isRecording) {
      // Stop recording logic
      Alert.alert(
        'Grabación Finalizada',
        `La grabación ha sido guardada (${formatTime(recordingTime)})`,
        [{ text: 'OK' }]
      );
    } else {
      // Start recording logic
    }
  };

  const handlePlayRecording = (item: RecordedCall) => {
    // Logic to play a recording
    Alert.alert(
      'Reproduciendo Grabación',
      `Número: ${item.phoneNumber}\nFecha: ${item.date}\nDuración: ${item.duration}`,
      [{ text: 'Cerrar' }]
    );
  };

  const handleDeleteRecording = (item: RecordedCall) => {
    // Logic to delete a recording
    Alert.alert(
      'Eliminar Grabación',
      `¿Está seguro que desea eliminar esta grabación?\n\nNúmero: ${item.phoneNumber}\nFecha: ${item.date}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive' }
      ]
    );
  };

  const handleShareRecording = (item: RecordedCall) => {
    // Logic to share a recording
    Alert.alert(
      'Compartir Grabación',
      `¿Desea compartir esta grabación con las autoridades?\n\nNúmero: ${item.phoneNumber}\nFecha: ${item.date}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Compartir' }
      ]
    );
  };

  const handleAcceptConsent = () => {
    setConsentAccepted(true);
    setConsentModalVisible(false);
  };

  const handleRejectConsent = () => {
    Alert.alert(
      'Permiso Requerido',
      'No se pueden grabar llamadas sin aceptar los términos legales. Puede cambiar esta configuración más adelante.',
      [{ text: 'OK' }]
    );
    setConsentModalVisible(false);
  };

  const renderRecordingItem = ({ item }: { item: RecordedCall }) => (
    <View style={styles.recordingItem}>
      <View style={styles.recordingInfo}>
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        <Text style={styles.recordingDetails}>
          {item.date} | {item.time} | {item.duration}
        </Text>
        <Text style={styles.fileSize}>{item.fileSize}</Text>
      </View>
      
      <View style={styles.recordingActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handlePlayRecording(item)}
        >
          <FontAwesome5 name="play-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShareRecording(item)}
        >
          <FontAwesome5 name="share-alt" size={22} color={Colors.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteRecording(item)}
        >
          <FontAwesome5 name="trash-alt" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <PoliceHeader 
        title="Grabación de Llamadas" 
        subtitle="Registre evidencias de extorsión" 
      />
      
      {/* Legal Disclaimer */}
      <View style={styles.contentContainer}>
        <View style={styles.disclaimerContainer}>
          <FontAwesome5 name="exclamation-triangle" size={20} color={Colors.warning} style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            La grabación de llamadas debe realizarse siguiendo las normativas legales.
            Se recomienda informar a la otra persona que la llamada está siendo grabada.
          </Text>
        </View>
        
        {/* Recording Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.recordingStatus}>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Grabando | {formatTime(recordingTime)}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.recordButton,
              isRecording && styles.recordingActive
            ]}
            onPress={handleRecordPress}
            activeOpacity={0.7}
          >
            <FontAwesome5 
              name={isRecording ? "stop-circle" : "microphone"} 
              size={32} 
              color={Colors.light} 
            />
            <Text style={styles.recordButtonText}>
              {isRecording ? "Detener" : "Grabar Llamada"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Grabar todas las llamadas</Text>
              <Text style={styles.settingDescription}>
                Graba automáticamente todas las llamadas entrantes y salientes
              </Text>
            </View>
            <Switch
              value={recordAllCalls}
              onValueChange={setRecordAllCalls}
              trackColor={{ false: '#D0D0D0', true: Colors.primary }}
              thumbColor={recordAllCalls ? Colors.secondary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Grabar llamadas sospechosas</Text>
              <Text style={styles.settingDescription}>
                Graba automáticamente llamadas de números reportados como sospechosos
              </Text>
            </View>
            <Switch
              value={recordSuspiciousCalls}
              onValueChange={setRecordSuspiciousCalls}
              trackColor={{ false: '#D0D0D0', true: Colors.primary }}
              thumbColor={recordSuspiciousCalls ? Colors.secondary : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Recordings List */}
        <View style={styles.recordingsContainer}>
          <Text style={styles.sectionTitle}>Grabaciones Recientes</Text>
          
          {RECORDED_CALLS.length > 0 ? (
            <FlatList
              data={RECORDED_CALLS}
              keyExtractor={item => item.id}
              renderItem={renderRecordingItem}
              contentContainerStyle={styles.recordingsList}
            />
          ) : (
            <View style={styles.noRecordingsContainer}>
              <FontAwesome5 name="inbox" size={40} color="#CCCCCC" />
              <Text style={styles.noRecordingsText}>
                No hay grabaciones disponibles
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Consent Modal */}
      <Modal
        visible={consentModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Consentimiento Legal</Text>
            </View>
            
            <Text style={styles.modalText}>
              Para utilizar la función de grabación de llamadas, debe aceptar los siguientes términos:
            </Text>
            
            <View style={styles.consentItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} style={styles.consentIcon} />
              <Text style={styles.consentText}>
                Usted debe informar a la otra parte que la llamada está siendo grabada.
              </Text>
            </View>
            
            <View style={styles.consentItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} style={styles.consentIcon} />
              <Text style={styles.consentText}>
                Las grabaciones solo deben utilizarse como evidencia en casos de extorsión.
              </Text>
            </View>
            
            <View style={styles.consentItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} style={styles.consentIcon} />
              <Text style={styles.consentText}>
                Usted es responsable del uso legal de las grabaciones.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <AppButton 
                title="Rechazar" 
                variant="outline"
                onPress={handleRejectConsent}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton 
                title="Aceptar" 
                variant="primary"
                onPress={handleAcceptConsent}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFDE7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    alignItems: 'center',
  },
  disclaimerIcon: {
    marginRight: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
  },
  controlsContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recordingStatus: {
    height: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.danger,
    marginRight: 8,
  },
  recordingText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
  },
  recordingActive: {
    backgroundColor: Colors.danger,
  },
  recordButtonText: {
    color: Colors.light,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  settingsContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recordingsContainer: {
    flex: 1,
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recordingsList: {
    paddingBottom: 16,
  },
  recordingItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
    paddingVertical: 12,
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  recordingDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  noRecordingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noRecordingsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.light,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalText: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 16,
    lineHeight: 22,
  },
  consentItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  consentIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
}); 