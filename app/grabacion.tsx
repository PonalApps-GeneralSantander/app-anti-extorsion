import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  Switch,
  ScrollView,
  Platform,
  PermissionsAndroid,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';

import { Colors } from "../constants/Colors";
import AppButton from "../components/AppButton";
import PoliceHeader from "../components/PoliceHeader";

interface RecordedCall {
  id: string;
  phoneNumber: string;
  date: string;
  time: string;
  duration: string;
  fileSize: string;
  filePath: string;
  fileName: string;
}

const RECORDINGS_STORAGE_KEY = '@call_recordings';

export default function GrabacionScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordAllCalls, setRecordAllCalls] = useState(false);
  const [recordSuspiciousCalls, setRecordSuspiciousCalls] = useState(true);
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedCalls, setRecordedCalls] = useState<RecordedCall[]>([]);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");
  const [appStateListener, setAppStateListener] = useState<any>(null);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [autoRecordingActive, setAutoRecordingActive] = useState(false);
  const [showQuickRecordModal, setShowQuickRecordModal] = useState(false);
  const [incomingPhoneNumber, setIncomingPhoneNumber] = useState("");

  useEffect(() => {
    checkPermissions();
    loadRecordings();
    loadSettings();
    setupCallDetection();
    
    return () => {
      cleanupCallDetection();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const checkPermissions = async () => {
    try {
      // Solicitar permisos de audio
      const audioPermission = await Audio.requestPermissionsAsync();
      
      // Solicitar permisos de media library
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      if (audioPermission.status === 'granted' && mediaPermission.status === 'granted') {
        setPermissionsGranted(true);
        console.log('✅ Permisos de audio y almacenamiento concedidos');
      } else {
        setPermissionsGranted(false);
        console.warn('⚠️ Permisos no concedidos');
        Alert.alert(
          'Permisos Requeridos',
          'La aplicación necesita permisos de micrófono y almacenamiento para grabar llamadas.',
          [
            { text: 'Configuración', onPress: () => checkPermissions() },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionsGranted(false);
    }
  };

  const loadSettings = async () => {
    try {
      const consent = await AsyncStorage.getItem('@consent_accepted');
      const recordAll = await AsyncStorage.getItem('@record_all_calls');
      const recordSuspicious = await AsyncStorage.getItem('@record_suspicious_calls');
      
      if (consent === 'true') {
        setConsentAccepted(true);
      } else {
        setConsentModalVisible(true);
      }
      
      if (recordAll === 'true') {
        setRecordAllCalls(true);
      }
      
      if (recordSuspicious !== null) {
        setRecordSuspiciousCalls(recordSuspicious === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('@consent_accepted', consentAccepted.toString());
      await AsyncStorage.setItem('@record_all_calls', recordAllCalls.toString());
      await AsyncStorage.setItem('@record_suspicious_calls', recordSuspiciousCalls.toString());
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const loadRecordings = async () => {
    try {
      const savedRecordings = await AsyncStorage.getItem(RECORDINGS_STORAGE_KEY);
      if (savedRecordings) {
        const recordings = JSON.parse(savedRecordings);
        // Verificar que los archivos aún existen
        const validRecordings = [];
        for (const recording of recordings) {
          const fileExists = await FileSystem.getInfoAsync(recording.filePath);
          if (fileExists.exists) {
            validRecordings.push(recording);
          }
        }
        setRecordedCalls(validRecordings);
        // Actualizar la lista si algunos archivos ya no existen
        if (validRecordings.length !== recordings.length) {
          await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(validRecordings));
        }
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  };

  const saveRecording = async (newRecording: RecordedCall) => {
    try {
      const updatedRecordings = [newRecording, ...recordedCalls];
      setRecordedCalls(updatedRecordings);
      await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const generateFileName = (): string => {
    const now = new Date();
    const timestamp = now.getTime();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    return `call_recording_${dateStr}_${timeStr}_${timestamp}.m4a`;
  };

  const startRecording = async () => {
    if (!permissionsGranted) {
      Alert.alert('Permisos Requeridos', 'Necesita otorgar permisos de micrófono para grabar.');
      await checkPermissions();
      return;
    }

    if (!consentAccepted) {
      setConsentModalVisible(true);
      return;
    }

    try {
      console.log('🎤 Iniciando grabación...');
      
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

             // Configuración de grabación simplificada
       const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(newRecording);
      setIsRecording(true);
      
      console.log('✅ Grabación iniciada');
      
      // Simular número de teléfono (en una app real, esto vendría del sistema)
      setCurrentPhoneNumber('+57 300 123 4567');
      
    } catch (error) {
      console.error('💥 Error starting recording:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación. Verifique los permisos.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('🛑 Deteniendo grabación...');
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
                 // Obtener información del archivo
         const fileInfo = await FileSystem.getInfoAsync(uri);
         const fileName = generateFileName();
         const documentsDir = FileSystem.documentDirectory + 'recordings/';
         
         // Crear directorio si no existe
         const dirInfo = await FileSystem.getInfoAsync(documentsDir);
         if (!dirInfo.exists) {
           await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
         }
         
         const newPath = documentsDir + fileName;
         
         // Mover archivo a la carpeta de grabaciones
         await FileSystem.moveAsync({
           from: uri,
           to: newPath,
         });

         // Obtener el tamaño del archivo después de moverlo
         const movedFileInfo = await FileSystem.getInfoAsync(newPath);
         const fileSize = movedFileInfo.exists && 'size' in movedFileInfo ? movedFileInfo.size : 0;

         // Crear objeto de grabación
         const now = new Date();
         const newRecordingData: RecordedCall = {
           id: Date.now().toString(),
           phoneNumber: currentPhoneNumber,
           date: now.toLocaleDateString('es-CO'),
           time: now.toLocaleTimeString('es-CO', { hour12: true }),
           duration: formatTime(recordingTime),
           fileSize: formatFileSize(fileSize),
           filePath: newPath,
           fileName: fileName,
         };

         await saveRecording(newRecordingData);
         
         console.log('✅ Grabación guardada:', newRecordingData);
         
         Alert.alert(
           'Grabación Finalizada',
           `La grabación ha sido guardada exitosamente.\n\nDuración: ${formatTime(recordingTime)}\nTamaño: ${formatFileSize(fileSize)}`,
           [{ text: 'OK' }]
         );
      }
    } catch (error) {
      console.error('💥 Error stopping recording:', error);
      Alert.alert('Error', 'Hubo un problema al guardar la grabación.');
    }
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handlePlayRecording = async (item: RecordedCall) => {
    try {
      console.log('▶️ Reproduciendo:', item.filePath);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.filePath },
        { shouldPlay: true }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      
      Alert.alert(
        'Reproduciendo Grabación',
        `Número: ${item.phoneNumber}\nFecha: ${item.date}\nDuración: ${item.duration}`,
        [
          { text: 'Detener', onPress: () => sound.stopAsync() },
          { text: 'Cerrar', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'No se pudo reproducir la grabación.');
    }
  };

  const handleDeleteRecording = (item: RecordedCall) => {
    Alert.alert(
      'Eliminar Grabación',
      `¿Está seguro que desea eliminar esta grabación?\n\nNúmero: ${item.phoneNumber}\nFecha: ${item.date}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Eliminar archivo físico
              await FileSystem.deleteAsync(item.filePath);
              
              // Actualizar lista
              const updatedRecordings = recordedCalls.filter(rec => rec.id !== item.id);
              setRecordedCalls(updatedRecordings);
              await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(updatedRecordings));
              
              console.log('🗑️ Grabación eliminada:', item.fileName);
            } catch (error) {
              console.error('Error deleting recording:', error);
              Alert.alert('Error', 'No se pudo eliminar la grabación.');
            }
          }
        },
      ]
    );
  };

  const handleShareRecording = async (item: RecordedCall) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
        return;
      }

      Alert.alert(
        'Compartir Grabación',
        `¿Desea compartir esta grabación?\n\nNúmero: ${item.phoneNumber}\nFecha: ${item.date}\nDuración: ${item.duration}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Compartir',
            onPress: async () => {
              try {
                await Sharing.shareAsync(item.filePath, {
                  mimeType: 'audio/mp4',
                  dialogTitle: `Grabación de llamada - ${item.phoneNumber}`,
                });
              } catch (error) {
                console.error('Error sharing recording:', error);
                Alert.alert('Error', 'No se pudo compartir la grabación.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error checking sharing availability:', error);
      Alert.alert('Error', 'No se pudo compartir la grabación.');
    }
  };

  const handleAcceptConsent = async () => {
    setConsentAccepted(true);
    setConsentModalVisible(false);
    await saveSettings();
  };

  const handleRejectConsent = () => {
    Alert.alert(
      'Permiso Requerido',
      'No se pueden grabar llamadas sin aceptar los términos legales. Puede cambiar esta configuración más adelante.',
      [{ text: 'OK' }]
    );
    setConsentModalVisible(false);
  };

  useEffect(() => {
    saveSettings();
  }, [recordAllCalls, recordSuspiciousCalls]);

  const handleSimulatedCall = (phoneNumber: string) => {
    console.log('📞 Simulando llamada entrante de:', phoneNumber);
    
    setCurrentPhoneNumber(phoneNumber);
    setIsIncomingCall(true);
    
    Alert.alert(
      'Llamada Entrante Simulada',
      `Número: ${phoneNumber}\n\n¿Desea iniciar la grabación automática?`,
      [
        { 
          text: 'Rechazar Llamada', 
          style: 'destructive',
          onPress: () => {
            setIsIncomingCall(false);
            console.log('📞 Llamada simulada rechazada');
          }
        },
        { 
          text: 'Contestar y Grabar', 
          onPress: () => {
            if (recordAllCalls || recordSuspiciousCalls) {
              startAutoRecording();
            } else {
              Alert.alert(
                'Grabación No Configurada',
                'Active "Grabar todas las llamadas" o "Grabar llamadas sospechosas" para grabación automática.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const setupCallDetection = () => {
    try {
      // Configurar detección de cambios de estado de la app
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      setAppStateListener(subscription);
      
      // Configurar notificaciones para recordatorios
      setupNotifications();
      
      console.log('✅ Detección de estado de app configurada');
    } catch (error) {
      console.error('💥 Error configurando detección:', error);
    }
  };

  const cleanupCallDetection = () => {
    if (appStateListener) {
      appStateListener.remove();
      setAppStateListener(null);
      console.log('🧹 Detección de estado limpiada');
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('📱 App state changed to:', nextAppState);
    
    // Cuando la app vuelve del background, podría indicar que terminó una llamada
    if (nextAppState === 'active' && autoRecordingActive) {
      // Preguntar si quiere detener la grabación
      Alert.alert(
        'Grabación en Curso',
        '¿Desea detener la grabación actual?',
        [
          { text: 'Continuar Grabando', style: 'cancel' },
          { text: 'Detener', onPress: () => stopAutoRecording() }
        ]
      );
    }
  };

  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ Permisos de notificaciones no concedidos');
        return;
      }
      
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (error) {
      console.error('Error configurando notificaciones:', error);
    }
  };

  const handleIncomingCall = async (phoneNumber: string) => {
    console.log('📞 Llamada entrante de:', phoneNumber);
    
    // Verificar si es un número sospechoso (integración con API de reportes)
    if (recordSuspiciousCalls) {
      // Aquí podrías verificar contra la base de datos de números reportados
      console.log('🔍 Verificando si es número sospechoso:', phoneNumber);
    }
  };

  const startAutoRecording = async () => {
    if (!permissionsGranted || !consentAccepted) {
      console.log('⚠️ No se puede grabar automáticamente - permisos/consentimiento faltante');
      return;
    }

    try {
      console.log('🎤 Iniciando grabación automática...');
      setAutoRecordingActive(true);
      
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Configuración de grabación simplificada
      const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(newRecording);
      setIsRecording(true);
      
      console.log('✅ Grabación automática iniciada');
      
      // Mostrar notificación discreta
      Alert.alert(
        'Grabación Automática',
        `Grabando llamada de ${currentPhoneNumber}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
      
    } catch (error) {
      console.error('💥 Error en grabación automática:', error);
      setAutoRecordingActive(false);
    }
  };

  const stopAutoRecording = async () => {
    if (!recording || !autoRecordingActive) return;

    try {
      console.log('🛑 Deteniendo grabación automática...');
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      setAutoRecordingActive(false);

      if (uri) {
        // Obtener información del archivo
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const fileName = generateFileName();
        const documentsDir = FileSystem.documentDirectory + 'recordings/';
        
        // Crear directorio si no existe
        const dirInfo = await FileSystem.getInfoAsync(documentsDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
        }
        
        const newPath = documentsDir + fileName;
        
        // Mover archivo a la carpeta de grabaciones
        await FileSystem.moveAsync({
          from: uri,
          to: newPath,
        });

        // Obtener el tamaño del archivo después de moverlo
        const movedFileInfo = await FileSystem.getInfoAsync(newPath);
        const fileSize = movedFileInfo.exists && 'size' in movedFileInfo ? movedFileInfo.size : 0;

        // Crear objeto de grabación
        const now = new Date();
        const newRecordingData: RecordedCall = {
          id: Date.now().toString(),
          phoneNumber: currentPhoneNumber,
          date: now.toLocaleDateString('es-CO'),
          time: now.toLocaleTimeString('es-CO', { hour12: true }),
          duration: formatTime(recordingTime),
          fileSize: formatFileSize(fileSize),
          filePath: newPath,
          fileName: fileName,
        };

        await saveRecording(newRecordingData);
        
        console.log('✅ Grabación automática guardada:', newRecordingData);
        
        // Notificación de grabación completada
        Alert.alert(
          'Grabación Completada',
          `Llamada de ${currentPhoneNumber} grabada automáticamente.\n\nDuración: ${formatTime(recordingTime)}\nTamaño: ${formatFileSize(fileSize)}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💥 Error deteniendo grabación automática:', error);
      setAutoRecordingActive(false);
    }
  };

  const renderRecordingItem = ({ item }: { item: RecordedCall }) => (
    <View style={styles.recordingItem}>
      <View style={styles.recordingInfo}>
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        <Text style={styles.recordingDetails}>
          {item.date} | {item.time} | {item.duration}
        </Text>
        <Text style={styles.fileSize}>{item.fileSize}</Text>
        <Text style={styles.fileName}>{item.fileName}</Text>
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <PoliceHeader
        title="Grabación de Llamadas"
        subtitle="Registre evidencias de extorsión"
      />

      <ScrollView style={styles.contentContainer}>
        {/* Legal Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <FontAwesome5
            name="exclamation-triangle"
            size={20}
            color={Colors.warning}
            style={styles.disclaimerIcon}
          />
          <Text style={styles.disclaimerText}>
            La grabación de llamadas debe realizarse siguiendo las normativas
            legales. Se recomienda informar a la otra persona que la llamada
            está siendo grabada.
          </Text>
        </View>

        {/* Permission Status */}
        {!permissionsGranted && (
          <View style={styles.permissionContainer}>
            <FontAwesome5
              name="exclamation-circle"
              size={20}
              color={Colors.danger}
              style={styles.disclaimerIcon}
            />
            <Text style={styles.permissionText}>
              Se requieren permisos de micrófono y almacenamiento para grabar llamadas.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={checkPermissions}
            >
              <Text style={styles.permissionButtonText}>Conceder Permisos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recording Controls */}
        <View style={styles.controlsContainer}>
          {isRecording && (
            <View style={styles.recordingStatus}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  Grabando | {formatTime(recordingTime)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.recordButton, 
              isRecording && styles.recordingActive,
              !permissionsGranted && styles.recordButtonDisabled
            ]}
            onPress={handleRecordPress}
            activeOpacity={0.7}
            disabled={!permissionsGranted}
          >
            <FontAwesome5
              name={isRecording ? "stop-circle" : "microphone"}
              size={32}
              color={Colors.light}
            />
            <Text style={styles.recordButtonText}>
              {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
            </Text>
          </TouchableOpacity>
          
          {!permissionsGranted && (
            <Text style={styles.disabledText}>
              Conceda permisos para habilitar la grabación
            </Text>
          )}
        </View>

        {/* Auto Recording Status */}
        {(recordAllCalls || recordSuspiciousCalls) && (
          <View style={styles.autoRecordingContainer}>
            <View style={styles.autoRecordingHeader}>
              <FontAwesome5
                name="robot"
                size={20}
                color={Colors.primary}
                style={styles.autoRecordingIcon}
              />
              <Text style={styles.autoRecordingTitle}>Grabación Automática</Text>
                             <View style={[
                 styles.statusIndicator,
                 { backgroundColor: appStateListener ? Colors.success : Colors.textSecondary }
               ]}>
                 <Text style={styles.statusText}>
                   {appStateListener ? 'ACTIVA' : 'INACTIVA'}
                 </Text>
               </View>
            </View>
            
            {isIncomingCall && (
              <View style={styles.incomingCallAlert}>
                <FontAwesome5 name="phone-alt" size={16} color={Colors.warning} />
                <Text style={styles.incomingCallText}>
                  Llamada entrante detectada: {currentPhoneNumber}
                </Text>
              </View>
            )}
            
            {autoRecordingActive && (
              <View style={styles.autoRecordingAlert}>
                <View style={styles.recordingDot} />
                <Text style={styles.autoRecordingText}>
                  Grabando automáticamente...
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.quickRecordButton}
              onPress={() => setShowQuickRecordModal(true)}
            >
              <FontAwesome5 name="phone-alt" size={16} color={Colors.primary} />
              <Text style={styles.quickRecordText}>
                Simular Llamada Entrante
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
              trackColor={{ false: "#D0D0D0", true: Colors.primary }}
              thumbColor={recordAllCalls ? Colors.secondary : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>
                Grabar llamadas sospechosas
              </Text>
              <Text style={styles.settingDescription}>
                Graba automáticamente llamadas de números reportados como
                sospechosos
              </Text>
            </View>
            <Switch
              value={recordSuspiciousCalls}
              onValueChange={setRecordSuspiciousCalls}
              trackColor={{ false: "#D0D0D0", true: Colors.primary }}
              thumbColor={recordSuspiciousCalls ? Colors.secondary : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Recordings List */}
        <View style={styles.recordingsContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Grabaciones Recientes ({recordedCalls.length})
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadRecordings}
            >
              <FontAwesome5 name="sync-alt" size={14} color={Colors.primary} />
              <Text style={styles.refreshText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {recordedCalls.length > 0 ? (
            <FlatList
              data={recordedCalls}
              keyExtractor={(item) => item.id}
              renderItem={renderRecordingItem}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noRecordingsContainer}>
              <FontAwesome5 name="microphone-slash" size={40} color="#CCCCCC" />
              <Text style={styles.noRecordingsText}>
                No hay grabaciones disponibles
              </Text>
              <Text style={styles.noRecordingsSubtext}>
                Presione "Iniciar Grabación" para comenzar a grabar llamadas
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Quick Record Modal */}
      <Modal
        visible={showQuickRecordModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Simular Llamada Entrante</Text>
            </View>

            <Text style={styles.modalText}>
              Para probar la grabación automática, ingresa un número de teléfono:
            </Text>

            <TextInput
              style={styles.phoneInput}
              placeholder="+57 300 123 4567"
              value={incomingPhoneNumber}
              onChangeText={setIncomingPhoneNumber}
              keyboardType="phone-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowQuickRecordModal(false);
                  setIncomingPhoneNumber("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => {
                  if (incomingPhoneNumber.trim()) {
                    handleSimulatedCall(incomingPhoneNumber.trim());
                    setShowQuickRecordModal(false);
                    setIncomingPhoneNumber("");
                  } else {
                    Alert.alert('Error', 'Por favor ingresa un número de teléfono válido');
                  }
                }}
              >
                <Text style={styles.acceptButtonText}>Simular Llamada</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              Para utilizar la función de grabación de llamadas, debe aceptar
              los siguientes términos:
            </Text>

            <View style={styles.consentItem}>
              <FontAwesome5
                name="check-circle"
                size={16}
                color={Colors.primary}
                style={styles.consentIcon}
              />
              <Text style={styles.consentText}>
                Usted debe informar a la otra parte que la llamada está siendo
                grabada.
              </Text>
            </View>

            <View style={styles.consentItem}>
              <FontAwesome5
                name="check-circle"
                size={16}
                color={Colors.primary}
                style={styles.consentIcon}
              />
              <Text style={styles.consentText}>
                Las grabaciones solo deben utilizarse como evidencia en casos de
                extorsión.
              </Text>
            </View>

            <View style={styles.consentItem}>
              <FontAwesome5
                name="check-circle"
                size={16}
                color={Colors.primary}
                style={styles.consentIcon}
              />
              <Text style={styles.consentText}>
                Usted es responsable del uso legal de las grabaciones.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleRejectConsent}
              >
                <Text style={styles.cancelButtonText}>Rechazar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={handleAcceptConsent}
              >
                <Text style={styles.acceptButtonText}>Aceptar</Text>
              </TouchableOpacity>
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
    flexDirection: "row",
    backgroundColor: "#FFFDE7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    alignItems: "center",
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
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recordingStatus: {
    height: 24,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
  },
  recordingActive: {
    backgroundColor: Colors.danger,
  },
  recordButtonText: {
    color: Colors.light,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  settingsContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recordingsContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
  recordingItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
    paddingVertical: 12,
    alignItems: "center",
  },
  recordingInfo: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: "600",
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
  fileName: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  recordingActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  noRecordingsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noRecordingsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  noRecordingsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.light,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: Colors.primary,
  },
  modalText: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 16,
    lineHeight: 22,
  },
  consentItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
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
    flexDirection: "row",
    marginTop: 20,
    gap: 16,
    alignItems: 'stretch',
  },
  permissionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFDE7",
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  permissionButton: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light,
  },
  recordButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 16,
  },
  autoRecordingContainer: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  autoRecordingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  autoRecordingIcon: {
    marginRight: 12,
  },
  autoRecordingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.light,
    fontSize: 12,
    fontWeight: "bold",
  },
  incomingCallAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  incomingCallText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.warning,
    fontWeight: "600",
  },
  autoRecordingAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8D7DA",
    padding: 8,
    borderRadius: 6,
  },
  autoRecordingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.danger,
    fontWeight: "600",
  },
  quickRecordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 8,
  },
  quickRecordText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 16,
    backgroundColor: Colors.light,
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: 'transparent', // Asegurar que no haya conflictos de fondo
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  acceptButtonText: {
    color: Colors.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
