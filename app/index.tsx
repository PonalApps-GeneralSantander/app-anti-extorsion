import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";

import { Colors } from "../constants/Colors";
import EmergencyContactCard from "../components/EmergencyContactCard";
import ReportStatusModal from "../components/ReportStatusModal";
import { API_CONFIG, buildApiUrl, getApiHeaders } from "../constants/ApiConfig";

interface LatestReport {
  id: string;
  caseNumber: string;
  phoneNumber: string;
  incidentDate: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function HomeScreen() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const fetchLatestReport = async () => {
    setLoadingReport(true);
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.REPORTS}?page=1&limit=1`);
      const headers = getApiHeaders();
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data.success && data.data.reports && data.data.reports.length > 0) {
        const report = data.data.reports[0];
        setLatestReport({
          id: report.id,
          caseNumber: report.caseNumber,
          phoneNumber: report.phoneNumber,
          incidentDate: report.incidentDate,
          description: report.description,
          status: report.status,
          createdAt: report.createdAt
        });
      }
    } catch (error) {
      console.error('Error fetching latest report:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      "Llamada de Emergencia",
      "¿Desea realizar una llamada de emergencia al 123?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Llamar",
          onPress: () => {
            // Logic to make the call would go here
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Colors.warning;
      case 'IN_REVIEW':
        return Colors.info;
      case 'RESOLVED':
        return Colors.success;
      case 'CLOSED':
        return Colors.textSecondary;
      default:
        return Colors.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'IN_REVIEW':
        return 'En Revisión';
      case 'RESOLVED':
        return 'Resuelto';
      case 'CLOSED':
        return 'Cerrado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 170 }}>
        <View style={styles.headerOverlay}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/policia-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Aplicación SaveLife</Text>
          <Text style={styles.headerSubtitle}>
            App - SaveLife
          </Text>
        </View>

        {/* Colombian flag stripe */}
        <View style={styles.flagStripe}>
          <View
            style={[styles.flagColor, { backgroundColor: Colors.flagYellow }]}
          />
          <View
            style={[styles.flagColor, { backgroundColor: Colors.flagBlue }]}
          />
          <View
            style={[styles.flagColor, { backgroundColor: Colors.flagRed }]}
          />
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyPress}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name="exclamation-circle"
            size={24}
            color={Colors.light}
          />
          <Text style={styles.emergencyButtonText}>Emergencia</Text>
        </TouchableOpacity>

        {/* Quick Access Cards */}
        <View style={styles.quickAccessContainer}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          <View style={styles.cardRow}>
            <Link href="/reportar" asChild>
              <TouchableOpacity style={styles.quickCard} activeOpacity={0.7}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: Colors.danger },
                  ]}
                >
                  <FontAwesome5
                    name="exclamation-triangle"
                    size={20}
                    color={Colors.light}
                  />
                </View>
                <Text style={styles.cardTitle}>Reportar</Text>
                <Text style={styles.cardSubtitle}>Incidentes</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/alertas" asChild>
              <TouchableOpacity style={styles.quickCard} activeOpacity={0.7}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: Colors.warning },
                  ]}
                >
                  <FontAwesome5 name="bell" size={20} color={Colors.light} />
                </View>
                <Text style={styles.cardTitle}>Alertas</Text>
                <Text style={styles.cardSubtitle}>Recientes</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/grabacion" asChild>
              <TouchableOpacity style={styles.quickCard} activeOpacity={0.7}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: Colors.info },
                  ]}
                >
                  <FontAwesome5
                    name="microphone"
                    size={20}
                    color={Colors.light}
                  />
                </View>
                <Text style={styles.cardTitle}>Grabar</Text>
                <Text style={styles.cardSubtitle}>Llamadas</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Second row of cards */}
          <View style={styles.cardRow}>
            <TouchableOpacity 
              style={styles.quickCard} 
              activeOpacity={0.7}
              onPress={() => setShowReportModal(true)}
            >
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: Colors.primary },
                ]}
              >
                <FontAwesome5
                  name="search"
                  size={20}
                  color={Colors.light}
                />
              </View>
              <Text style={styles.cardTitle}>Consultar</Text>
              <Text style={styles.cardSubtitle}>Reportes</Text>
            </TouchableOpacity>

            <Link href="/recursos" asChild>
              <TouchableOpacity style={styles.quickCard} activeOpacity={0.7}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: Colors.success },
                  ]}
                >
                  <FontAwesome5 name="book" size={20} color={Colors.light} />
                </View>
                <Text style={styles.cardTitle}>Recursos</Text>
                <Text style={styles.cardSubtitle}>Información</Text>
              </TouchableOpacity>
            </Link>

            <View style={styles.quickCard} />
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.contactsContainer}>
          <Text style={styles.sectionTitle}>Contactos de Emergencia</Text>

          <EmergencyContactCard
            title="Línea de Emergencia"
            phoneNumber="123"
            description="Línea nacional de emergencias"
            icon="ambulance"
            isPrimary
          />

          <EmergencyContactCard
            title="CAI Caldas"
            phoneNumber="6014567890"
            description="Localidad Kennedy, Bogotá"
            icon="shield-alt"
          />

          <EmergencyContactCard
            title="GAULA SaveLife"
            phoneNumber="165"
            description="Grupo SaveLife y Secuestro"
            icon="user-shield"
          />
        </View>

        {/* Latest Report */}
        <View style={styles.alertContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Último Reporte</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchLatestReport}
              disabled={loadingReport}
            >
              <FontAwesome5 
                name="sync-alt" 
                size={14} 
                color={Colors.primary}
                style={{ opacity: loadingReport ? 0.5 : 1 }}
              />
              <Text style={[styles.refreshText, { opacity: loadingReport ? 0.5 : 1 }]}>
                {loadingReport ? 'Cargando...' : 'Actualizar'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {latestReport ? (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <FontAwesome5
                  name="file-alt"
                  size={18}
                  color={getStatusColor(latestReport.status)}
                />
                <Text style={styles.alertTitle}>
                  Caso: {latestReport.caseNumber}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(latestReport.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(latestReport.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.alertDate}>
                {formatDate(latestReport.createdAt)}
              </Text>
              <Text style={styles.phoneNumber}>
                📞 {latestReport.phoneNumber}
              </Text>
              <Text style={styles.alertDescription} numberOfLines={3}>
                {latestReport.description}
              </Text>
              <TouchableOpacity 
                style={styles.alertButton}
                onPress={() => setShowReportModal(true)}
              >
                <Text style={styles.alertButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <FontAwesome5
                  name="info-circle"
                  size={18}
                  color={Colors.textSecondary}
                />
                <Text style={[styles.alertTitle, { color: Colors.textSecondary }]}>
                  {loadingReport ? 'Cargando último reporte...' : 'No hay reportes disponibles'}
                </Text>
              </View>
              {!loadingReport && (
                <>
                  <Text style={styles.alertDescription}>
                    Aún no se han registrado reportes en el sistema. Sea el primero en reportar un incidente de extorsión.
                  </Text>
                  <Link href="/reportar" asChild>
                    <TouchableOpacity style={styles.alertButton}>
                      <Text style={styles.alertButtonText}>Crear Reporte</Text>
                    </TouchableOpacity>
                  </Link>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Report Status Modal */}
      <ReportStatusModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  headerBackground: {
    width: "100%",
    height: 180,
  },
  headerOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 69, 124, 0.85)", // Police blue with opacity
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "center",
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.light,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light,
    opacity: 0.9,
  },
  flagStripe: {
    flexDirection: "row",
    height: 5,
  },
  flagColor: {
    flex: 1,
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emergencyButtonText: {
    color: Colors.light,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  quickAccessContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickCard: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.dark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contactsContainer: {
    marginBottom: 24,
  },
  alertContainer: {
    marginBottom: 24,
  },
  alertCard: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginLeft: 8,
  },
  alertDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  alertButtonText: {
    color: Colors.light,
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  refreshButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
    marginLeft: 8,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.light,
  },
  phoneNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
});
