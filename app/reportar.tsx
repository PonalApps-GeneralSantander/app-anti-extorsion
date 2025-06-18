import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import AppButton from '../components/AppButton';
import PoliceHeader from '../components/PoliceHeader';
import { ReportsService } from '../services/reportsService';

export default function ReportarScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [hasEvidence, setHasEvidence] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Crear objeto con los datos del formulario
    const formData = {
      phoneNumber,
      date,
      time,
      description,
      hasEvidence,
      anonymous,
      reporterName,
      reporterContact,
      termsAccepted
    };

    // Validación local
    const validationErrors = ReportsService.validateReportData(formData);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(error => error.message).join('\n');
      Alert.alert('Error de Validación', errorMessage);
      return;
    }

    setLoading(true);
    
    try {
      // Formatear datos para la API
      const reportData = ReportsService.formatReportData(formData);
      
      // Enviar reporte a la API
      const response = await ReportsService.createReport(reportData);
      
      if (response.success) {
        Alert.alert(
          'Reporte Enviado',
          `${response.message}\n\nNúmero de caso: ${response.data.caseNumber}`,
          [
            { 
              text: 'OK', 
              onPress: handleReset 
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      
      // Manejar errores específicos de la API
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('validation') || errorMessage.includes('validación')) {
        Alert.alert(
          'Error de Validación',
          'Por favor revise los datos ingresados y intente nuevamente.'
        );
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.'
        );
      } else if (errorMessage.includes('Too Many Requests')) {
        Alert.alert(
          'Demasiadas Solicitudes',
          'Ha excedido el límite de reportes. Por favor espere unos minutos antes de intentar nuevamente.'
        );
      } else {
        Alert.alert(
          'Error',
          'Ocurrió un error al enviar el reporte. Por favor intente nuevamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber('');
    setDate('');
    setTime('');
    setDescription('');
    setAnonymous(false);
    setReporterName('');
    setReporterContact('');
    setHasEvidence(false);
    setTermsAccepted(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <PoliceHeader 
        title="Reportar Incidente" 
        subtitle="Ayúdenos a combatir la extorsión" 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.contentContainer}>
          <View style={styles.infoContainer}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="info-circle" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.infoText}>
              La información proporcionada es confidencial y será utilizada exclusivamente 
              para fines de investigación por la Policía Nacional de Colombia.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Información del Incidente</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número Telefónico Sospechoso *</Text>
              <View style={styles.phoneInputContainer}>
                <FontAwesome5 name="phone" size={16} color={Colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Ej: 321 456 7890"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Fecha *</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD/MM/AAAA"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Hora *</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción del Incidente *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describa detalles de la llamada o mensaje, amenazas recibidas, solicitudes realizadas, etc."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>¿Cuenta con evidencia? (grabaciones, mensajes)</Text>
              <Switch
                value={hasEvidence}
                onValueChange={setHasEvidence}
                trackColor={{ false: '#D0D0D0', true: Colors.primary }}
                thumbColor={hasEvidence ? Colors.secondary : '#f4f3f4'}
              />
            </View>
          </View>
          
          {/* Reporter Information */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Información del Denunciante</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Realizar denuncia anónima</Text>
              <Switch
                value={anonymous}
                onValueChange={setAnonymous}
                trackColor={{ false: '#D0D0D0', true: Colors.primary }}
                thumbColor={anonymous ? Colors.secondary : '#f4f3f4'}
              />
            </View>
            
            {!anonymous && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre Completo *</Text>
                  <TextInput
                    style={styles.input}
                    value={reporterName}
                    onChangeText={setReporterName}
                    placeholder="Ingrese su nombre completo"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Teléfono de Contacto *</Text>
                  <TextInput
                    style={styles.input}
                    value={reporterContact}
                    onChangeText={setReporterContact}
                    placeholder="Ingrese su número de contacto"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}
          </View>
          
          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.termsCheckbox} 
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[
                styles.checkbox, 
                termsAccepted && styles.checkboxActive
              ]}>
                {termsAccepted && <FontAwesome5 name="check" size={12} color={Colors.light} />}
              </View>
              <Text style={styles.termsText}>
                Acepto los términos y condiciones y autorizo el tratamiento de mis datos personales
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Submit Buttons */}
          <View style={styles.buttonContainer}>
            <AppButton 
              title="Enviar Reporte" 
              variant="primary"
              loading={loading}
              disabled={loading}
              onPress={handleSubmit}
            />
            <AppButton 
              title="Cancelar" 
              variant="outline"
              style={{ marginTop: 12 }}
              onPress={handleReset}
              disabled={loading}
            />
          </View>
          
          <View style={styles.note}>
            <Text style={styles.noteText}>
              * Campos obligatorios
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  formContainer: {
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  phoneInputContainer: {
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
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  termsContainer: {
    marginBottom: 16,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  note: {
    marginBottom: 24,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
}); 